package controllers

import (
	"go-react-template/src/go/middleware"
	"go-react-template/src/go/services"
	"net/http"

	"github.com/gin-gonic/gin"
)

// LoginController ...
type LoginController struct {
	HTTPClient services.HTTPClient
}

// NewLoginController ...
func NewLoginController(httpClient services.HTTPClient, r *gin.Engine) LoginController {
	lc := LoginController{HTTPClient: httpClient}
	lc.InitRoutes(r)
	return lc
}

// InitRoutes ...
func (lc LoginController) InitRoutes(r *gin.Engine) {
	r.GET(`/`, middleware.EL(), lc.Home)
	r.GET(`/logout`, lc.Logout)
}

// Home ...
func (lc LoginController) Home(c *gin.Context) {
	// c.HTML(http.StatusOK, "index.html", gin.H{})
	c.HTML(http.StatusOK, "index.html", nil)
}

// Logout ...
func (lc LoginController) Logout(c *gin.Context) {
	c.SetCookie(`sessionToken`, "", -1, ``, ``, false, true)
	c.SetCookie(`sessionUserID`, "", -1, ``, ``, false, false)
	c.Redirect(http.StatusTemporaryRedirect, "/")
}
