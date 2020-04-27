package mongodb

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"go-react-template/src/go/pkg/logger"
	"go-react-template/src/go/pkg/mongodb/secret"
	"io/ioutil"
	"net"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// MongoURL from local or retrieved from SplitPea
var (
	MongoURL    string
	MongoClient *mongo.Client
	DBNAME      = os.Getenv(`MDB_NAME`)
	DBTimeoutMs int
	log         = logger.WithContext(logger.Context{})
)

// init ...
func init() {
	timeoutStr := os.Getenv("HTTP_CONNECTION_TIMEOUT_MS")
	if timeoutStr == "" {
		timeoutStr = "2000"
	}

	DBTimeoutMs, err := strconv.Atoi(timeoutStr)
	if err != nil {
		log.Errorf("Unable to convert timeoutStr to integer")
		DBTimeoutMs = 2000
	}

	// This httpClient is used when decrypting URL, otherwise not used at all
	var httpClient = &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				RootCAs: GetCertPool(),
			},
			Dial: (&net.Dialer{
				Timeout: time.Duration(DBTimeoutMs) * time.Millisecond,
			}).Dial,
		},
	}
	getMongoURL(httpClient)

	ctx, cancel := context.WithTimeout(
		context.Background(),
		time.Duration(DBTimeoutMs)*time.Millisecond)
	defer cancel()

	MongoClient, err = mongo.Connect(ctx, options.Client().ApplyURI(MongoURL))
	if err != nil {
		log.Fatalf("Error connecting to mongo: %v", err)
	}
}

func getMongoURL(httpClient secret.HTTPClient) {
	// this is a custom HttpClient, which has interface: Do(request) (response)
	secretClient := secret.NewSPClient(httpClient)
	// local, development, test, production
	env := os.Getenv(`ENV`)

	if strings.ToLower(env) == `local` || strings.ToLower(env) == `debug` {
		if os.Getenv(`MDB_URL`) == `` {
			panic(`MDB_URL must be set when running in LOCAL/DEBUG mode.`)
		}
		// already known, 'stored' URL for dev and test, not prod
		MongoURL = "mongodb://" + os.Getenv(`MDB_URL`)
	} else {
		/*
			1) Get SplitPea environment variables
			2) Make request to SplitPea service with vars in Post Body
			3) Success: SplitPea returns MongoDB connection string:
			-> 'mongo://servers...'
		*/
		MongoURL = secret.Decrypt(secret.DBUrl, secretClient)
	}

}

// GetCertPool gets the configuration values for the api
func GetCertPool() *x509.CertPool {
	caBundlePath := os.Getenv("CA_BUNDLE_PATH")
	newCert := x509.NewCertPool()
	caCert, err := ioutil.ReadFile(caBundlePath)
	if err != nil {
		log.Errorf("Unable to load CA Bundle: %v", err)
	} else {
		if !newCert.AppendCertsFromPEM(caCert) {
			log.Errorf("Unable to add CA Bundle")
		}
	}
	return newCert
}
