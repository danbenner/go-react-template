package controllers

import (
	"go-react-template/src/go/middleware"
	"go-react-template/src/go/services"

	"github.com/gin-gonic/gin"
)

// AdminController ...
type AdminController struct {
	HTTPClient services.HTTPClient
}

// NewAdminController ...
func NewAdminController(httpClient services.HTTPClient, r *gin.Engine) AdminController {
	ac := AdminController{HTTPClient: httpClient}
	ac.initRoutes(r)
	return ac
}

func (ac AdminController) initRoutes(r *gin.Engine) {
	r.GET(`/api/adGroups`, middleware.EL(), ac.FetchAuthorizedUsers)
}

// FetchAuthorizedUsers ...
// NOTE: these AD Groups are unique to previous project
func (ac AdminController) FetchAuthorizedUsers(c *gin.Context) {
	groups := []string{
		"EXAMPLE_AD_GROUP",
	}
	c.JSON(200, groups)
}
