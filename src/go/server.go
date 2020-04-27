package main

import (
	"fmt"
	"go-react-template/src/go/controllers"
	"go-react-template/src/go/services"
	"log"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

var (
	env          string
	port         string
	relativePath string
)

func init() {
	env := os.Getenv(`ENV`)
	log.Printf("GOOD: ENV: %v\n", env)
	if env == `DEBUG` {
		relativePath = os.Getenv(`WORKROOT`) // .vscode/launch.json
		// relativePath = `dist`
		port = `8081`
	} else if strings.ToUpper(env) == `LOCAL` {
		relativePath = `dist`
		port = `8081`
	} else {
		relativePath = "./"
		if port == `` {
			port = os.Getenv(`PORT`)
		} else {
			fmt.Printf("Your port has run amuck...)")
		}
	}
	log.Printf("GOOD: Basic Configuration Retrieved...\n")
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(CORS())
	router.Static(`/assets`, relativePath+`/assets/`) // NOTE: this route are unsafe/unsecure
	// NOTE: if React Router gives you trouble, try modifying the following and uncommenting
	// router.StaticFile(`/one/of/your/ReactRouter/routes`, relativePath+`/assets/html/index.html`)
	// router.StaticFile(`/another/route/defined/in/Content.jsx`, relativePath+`/assets/html/index.html`)
	router.LoadHTMLFiles(relativePath + `/assets/html/index.html`)
	// ------------------------- ROUTES -------------------------- //
	addServices(router)
	// ------------------ RUNNING -----------------//
	err := router.Run(`:` + port)
	if err != nil {
		log.Printf("ERROR: router.Run: %v\n", err.Error())
	}
}

func addServices(r *gin.Engine) {
	httpClient := services.NewClient()

	controllers.NewHealthController(httpClient, r)
	controllers.NewLoginController(httpClient, r)
	controllers.NewOAuthController(httpClient, r)
	controllers.NewFetchController(httpClient, r)
	controllers.NewAdminController(httpClient, r)
}

// CORS ...
func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")
		c.Writer.Header().Set("mode", "no-cors")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
