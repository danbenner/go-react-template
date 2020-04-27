package controllers

import (
	"go-react-template/src/go/pkg/helper"
	"go-react-template/src/go/pkg/ldap"
	"go-react-template/src/go/services"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

/*
	HandleOauth()
	- Parse Code from API request
	- Request Token from LDAP server
	- Decode Response - convert and unmarshal into JWT
	- Store Token (as string) and UserID
	 	- (optional) store AD Groups
	- LDAP - verify user access
*/

const (
	cookieLifespanInSeconds = 50000 // seconds
)

// OAuthController ...
type OAuthController struct {
	HTTPClient services.HTTPClient
	JWT        helper.JWT
	SSO        SingleSignOn
}

// SingleSignOn ...
type SingleSignOn struct {
	BaseAPIURL   string
	RedirectPath string
	AuthURL      string
	TokenURL     string
	ClientID     string
	ClientSecret string
}

// InitializeSSO ...
// NOTE: ALL info regarding SSO should be unique to the team (service account)
func (oc OAuthController) InitializeSSO(sso *SingleSignOn) {
	sso.BaseAPIURL = os.Getenv(`BASE_API_URL`)
	sso.RedirectPath = `oauth/redirect`
	sso.AuthURL = os.Getenv(`SSO_AUTH_URL`)
	sso.TokenURL = os.Getenv(`SSO_TOKEN_URL`)
	sso.ClientID = os.Getenv(`SSO_CLIENTID`)
	sso.ClientSecret = os.Getenv(`SSO_CLIENTSECRET`)
	log.Printf("GOOD: SSO initialized...\n")
}

// NewOAuthController ...
func NewOAuthController(httpClient services.HTTPClient, r *gin.Engine) OAuthController {
	oc := OAuthController{HTTPClient: httpClient}
	oc.InitializeSSO(&oc.SSO)
	oc.InitRoutes(r)
	return oc
}

// InitRoutes ...
func (oc OAuthController) InitRoutes(r *gin.Engine) {
	r.GET(`/oauth/redirect`, oc.HandleOauth)
}

// HandleOauth ...
func (oc OAuthController) HandleOauth(c *gin.Context) {
	// log := logger.WithContext(logger.Context{})
	// ----------------------------------- PARSE CODE ----------------------------------- //
	code, err := helper.GetSingleFormValue(c.Request, `code`)
	if err != nil {
		log.Printf("ERROR: Failed to retrieve 'code'; 'Key value not present': \n\tMSG: %v\n", err.Error())
		c.JSON(http.StatusInternalServerError, "ERROR: Failed to retrieve 'code'; 'Key value not present': MSG: "+err.Error())
		return
	}
	// ---------------------------------- REQUEST TOKEN --------------------------------- //
	urlKeyValuePairs := map[string]string{
		"client_id":     oc.SSO.ClientID,
		"client_secret": oc.SSO.ClientSecret,
		"grant_type":    `authorization_code`,
		"code":          code,
		"redirect_uri":  oc.SSO.BaseAPIURL + oc.SSO.RedirectPath,
	}
	res, err := oc.HTTPClient.PostForm(oc.SSO.TokenURL, helper.SetURLValues(urlKeyValuePairs))
	if err != nil {
		log.Printf("ERROR: Handle Oauth httpClient failed to Do(request); \n\tMSG: %v\n\tURL.Values: %v\n", err.Error(), urlKeyValuePairs)
		c.JSON(http.StatusInternalServerError, "ERROR: Handle Oauth httpClient failed to Do(request); "+err.Error())
		return
	}
	if res.StatusCode != 200 {
		defer res.Body.Close()
		response, errUnmarshall := helper.UnmarshallHTTPResponseBody(res.Body)
		if errUnmarshall != nil {
			log.Printf("ERROR: Unable to Unmarshall TOKEN POST non 200 response")
			c.JSON(http.StatusInternalServerError, response)
			return
		}
		log.Printf("ERROR: Response.StatusCode from TOKEN POST: %v\n\tResponse.Body: %v\n", res.StatusCode, response)
		c.JSON(http.StatusInternalServerError, response)
		return
	}

	// --------------------------------- DECODE RESPONSE -------------------------------- //
	errToken := oc.JWT.RetrieveToken(res.Body, &oc.JWT)
	if errToken != nil {
		log.Printf("ERROR: JWT.RetrieveToken: %v\n", errToken.Error())
		// DELETE COOKIES
		c.SetCookie(`sessionToken`, errToken.Error(), -1, ``, ``, false, true)
		c.SetCookie(`sessionUserID`, "error", -1, ``, ``, false, false)
		c.AbortWithStatus(http.StatusInternalServerError)
		return
	}
	errParseToken := oc.JWT.ParseToken(&oc.JWT)
	if errParseToken != nil {
		log.Printf("ERROR: JWT.ParseToken: %v\n", errToken.Error())
		// DELETE COOKIES
		c.SetCookie(`sessionToken`, errParseToken.Error(), -1, ``, ``, false, true)
		c.SetCookie(`sessionUserID`, "error", -1, ``, ``, false, false)
		c.Redirect(http.StatusTemporaryRedirect, "/")
		return
	}

	// ----------------------------------- STORE TOKENS --------------------------------- //
	// NOTE: Need to encrypt both Cookies
	c.SetCookie(`sessionToken`, oc.JWT.Token.AccessToken["access_token"].(string), cookieLifespanInSeconds, ``, ``, false, true)
	c.SetCookie(`sessionUserID`, oc.JWT.Payload.SUB, cookieLifespanInSeconds, ``, ``, false, false)

	// --------------------------------------- LDAP ------------------------------------- //
	_, matches, statusCode, err := ldap.CustomLDAPSearch(oc.JWT.Payload.SUB)
	if err != nil {
		if statusCode != 200 {
			log.Printf("SEVERE: ERROR: CustomLDAPSearch: %v\n", err.Error())
			c.AbortWithStatus(http.StatusInternalServerError)
			return
		}
		log.Printf("ERROR: LDAP: User:%v, Error: %v\n", oc.JWT.Payload.SUB, err.Error())
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	if len(matches) < 1 {
		// NOTE: if the user was found in LDAP, but has no matches
		log.Printf("LDAP: Invalid User: %v, matches: %v\n", oc.JWT.Payload.SUB, matches)
		c.AbortWithStatus(http.StatusForbidden)
		return
	}

	// NOTE: Need to encrypt Cookie
	c.SetCookie(`userADGroups`, strings.Join(matches, ","), cookieLifespanInSeconds, ``, ``, false, false)
	log.Printf("LDAP: Valid User: %v, matches: %v\n", oc.JWT.Payload.SUB, matches)
	c.Redirect(http.StatusTemporaryRedirect, "/")
}
