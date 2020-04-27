package controllers

import (
	"fmt"
	"go-react-template/src/go/middleware"
	"go-react-template/src/go/services"
	"io/ioutil"
	"net/http"
	"os"

	"log"

	"github.com/gin-gonic/gin"
)

// Fetch Vars ...
var (
	APIURL       = os.Getenv(`API_URL`)
	APIBASICAUTH = os.Getenv(`API_BASIC_AUTH`)
)

// FetchController ...
type FetchController struct {
	HTTPClient services.HTTPClient
}

// NewFetchController ...
func NewFetchController(httpClient services.HTTPClient, r *gin.Engine) FetchController {
	fc := FetchController{HTTPClient: httpClient}
	fc.InitRoutes(r)
	return fc
}

// InitRoutes ...
func (fc FetchController) InitRoutes(r *gin.Engine) {
	r.GET(`/products/:product/plans/:stateInitials`, middleware.EL(), fc.FetchPlans)
	r.GET(`/plans/:planID/members/:amisysID/eligible`, middleware.EL(), fc.FetchEligibility)
	r.GET(`/rewards/:rewardPlanID`, middleware.EL(), fc.FetchRewards)
}

// FetchPlans ...
func (fc FetchController) FetchPlans(c *gin.Context) {
	product := c.Param(`product`)
	stateInitials := c.Param(`stateInitials`)
	req, _ := http.NewRequest(`GET`, APIURL+`products/`+product+`/plans/`+stateInitials, nil)
	body, statusCode, err := makeAPIRequest(APIBASICAUTH, req, fc.HTTPClient)
	if err != nil {
		log.Printf("FetchPlans Error: %s", err.Error())
		if err.Error() == "ERROR Test Successful" {
			c.JSON(statusCode, err.Error())
			return
		}
		fmt.Printf("ERROR: Failed to FetchPlans: %v\n", err.Error())
		c.JSON(statusCode, err.Error())
	}
	c.String(statusCode, string(body))
}

// FetchEligibility ...
func (fc FetchController) FetchEligibility(c *gin.Context) {
	planID := c.Param(`planID`)
	amisysID := c.Param(`amisysID`)
	req, _ := http.NewRequest(`GET`, APIURL+`plans/`+planID+`/members/`+amisysID+`/eligible`, nil)
	body, statusCode, err := makeAPIRequest(APIBASICAUTH, req, fc.HTTPClient)
	if err != nil {
		log.Printf("FetchEligibility Error: %s", err.Error())
		if err.Error() == "ERROR Test Successful" {
			c.JSON(statusCode, err.Error())
			return
		}
		fmt.Printf("ERROR: Failed to FetchEligibility: %v\n", err.Error())
		c.JSON(statusCode, err.Error())
	}
	c.String(statusCode, string(body))
}

// FetchRewards ...
func (fc FetchController) FetchRewards(c *gin.Context) {
	rewardPlanID := c.Param(`rewardPlanID`)
	req, _ := http.NewRequest(`GET`, APIURL+`rewards/`+rewardPlanID, nil)
	body, statusCode, err := makeAPIRequest(APIBASICAUTH, req, fc.HTTPClient)
	if err != nil {
		log.Printf("FetchRewards Error: %s", err.Error())
		if err.Error() == "ERROR Test Successful" {
			c.JSON(statusCode, err.Error())
			return
		}
		c.JSON(statusCode, err.Error())
		return
	}
	c.String(statusCode, string(body))
}

// makeAPIRequest ...
func makeAPIRequest(auth string, req *http.Request, client services.HTTPClient) ([]byte, int, error) {
	req.Header.Add(`Authorization`, `Basic `+auth)
	req.Header.Add(`Content-Type`, `application/json`)
	response, err := client.Do(req)
	if err != nil {
		if err.Error() == "ERROR Test Successful" {
			return nil, http.StatusInternalServerError, err
		}
		return nil, http.StatusInternalServerError, err
	}
	bodyEncoded, err := ioutil.ReadAll(response.Body)
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return bodyEncoded, response.StatusCode, nil
}
