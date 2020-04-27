package secret

import (
	"bytes"
	b64 "encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

// HTTPClient interface
type HTTPClient interface {
	Do(*http.Request) (*http.Response, error)
}

// SPClient ... This structure allows for
type SPClient struct {
	HTTPClient HTTPClient
}

// NewSPClient ...
func NewSPClient(httpClient HTTPClient) *SPClient {
	return &SPClient{
		HTTPClient: httpClient,
	}
}

// PostBody ...
type PostBody struct {
	Euuid         string   `json:"eUUID"`
	KeyComponents []string `json:"keyComponents"`
}

//Decrypt ...
// key == iota, s == httpClient
func Decrypt(key Key, s *SPClient) (secretValue string) {

	env := strings.ToLower(os.Getenv("ENV"))
	euuid := os.Getenv("DATABASE_URL_EUUID")
	kc1 := ""
	kc2 := os.Getenv("DATABASE_URL_KEY_COMPONENT_2")
	basicAuthString := os.Getenv("DECRYPT_BASIC_AUTH")

	switch key {
	case DBUrl:
		switch env {
		case "development":
			kc1 = DbURLKc1Dev
		case "test":
			kc1 = DbURLKc1Test
		case "production":
			kc1 = DbURLKc1Prod
		}
	}

	body, err := json.Marshal(PostBody{euuid, []string{kc1, kc2}})
	if err != nil {
		fmt.Println("error assembling body: " + err.Error())
	}
	return s.getSecret(body, basicAuthString)
}

func (s *SPClient) getSecret(body []byte, basicAuthString string) (url string) {
	basicAuth := "Basic " + basicAuthString
	decryptURL := os.Getenv("DECRYPT_URL")
	axwayBasicAuth := os.Getenv("AXWAY_BASIC_AUTH")
	req, requestErr := http.NewRequest("POST", decryptURL, bytes.NewBuffer(body))
	if axwayBasicAuth != "" {
		req.Header.Set("Authorization", axwayBasicAuth)
	} else {
		req.Header.Set("Authorization", basicAuth)
	}
	if requestErr != nil {
		return
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.HTTPClient.Do(req)

	if err != nil {
		fmt.Println(err.Error())
		return
	}

	defer resp.Body.Close()
	responseBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println(err)
	}
	valueString := string(responseBody)
	decodedString, _ := b64.StdEncoding.DecodeString(valueString)
	return string(decodedString)
}
