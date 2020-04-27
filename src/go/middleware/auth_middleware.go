package middleware

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

/* ----------------------------------------------------------------------- */

// SSO ...
type SSO struct {
	BaseAPIURL   string
	RedirectPath string
	AuthURL      string
	TokenURL     string
	ClientID     string
	ClientSecret string
}

// NOTE: ALL info regarding SSO should be unique to the team (service account)
func newSSO() SSO {
	return SSO{
		BaseAPIURL:   os.Getenv(`BASE_API_URL`),
		RedirectPath: `oauth/redirect`,
		AuthURL:      os.Getenv(`SSO_AUTH_URL`),
		TokenURL:     os.Getenv(`SSO_TOKEN_URL`),
		ClientID:     os.Getenv(`SSO_CLIENTID`),
		ClientSecret: os.Getenv(`SSO_CLIENTSECRET`),
	}
}

/* ----------------------------------------------------------------------- */

// EnsureLoggedIn ...
func EnsureLoggedIn() gin.HandlerFunc {
	SSO := newSSO()
	return func(c *gin.Context) {
		token, err := c.Cookie(`sessionToken`)
		if err == nil || token != `` {
			return
		}
		// ----------------------- LOCAL ONLY ----------------------- //
		if strings.ToLower(os.Getenv("ENV")) == `debug` {
			c.SetCookie(`sessionToken`, "LOCAL ENV", 20000, ``, ``, false, true)
			c.SetCookie(`sessionUserID`, os.Getenv("ENV"), 20000, ``, ``, false, false)
			return
		}
		// ----------------- Not Logged In, Redirect ---------------- //
		params := fmt.Sprintf(
			"scope=openid profile&client_id=%s&response_type=code&redirect_uri=%s%s",
			SSO.ClientID, SSO.BaseAPIURL, SSO.RedirectPath)
		uri := url.PathEscape(params)
		var redirectURL = SSO.AuthURL + uri
		c.Redirect(http.StatusTemporaryRedirect, redirectURL)
		c.Abort()
	}
}

/* ----------------------------------------------------------------------- */

func fakeHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
	}
}

const forcedDebug = "off"

// debugMode ... Allows for Production Project to have debugging enabled
func debugMode() func() gin.HandlerFunc {
	if os.Getenv("DEBUG") == "on" || forcedDebug == "on" {
		return fakeHandler
	}
	return EnsureLoggedIn
}

// EL ... set to EnsureLoggedIn(), allows for testing routes
var EL = debugMode()

/* ----------------------------------------------------------------------- */
