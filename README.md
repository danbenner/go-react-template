# **go-react-template**

- [**go-react-template**](https://github.com/danbenner/go-react-template)
    - [***TL;DR***](#tldr)
  - [**Getting Started**](#getting-started)
    - [Tools](#tools)
  - [Getting Started](#getting-started-1)
  - [Building and Running](#building-and-running)

### ***TL;DR***
  - What: This is a template for a Single Page App using ***Golang (Gin) + React (Material-UI) + MongoDB***
  - How: REST api which serves a React frontend (bundle.js)
  - Why: Boilerplate for an SPA (intially an Admin App)

---

## **Getting Started**

(All instructions are designed for use on **Mac OS**)

### Tools
```
 - Visual Studio Code
  - Helpful Packages:
    - ESLint
    - Go
    - vscode-base64
 - Terminal
    - Brew
      ~$ brew install node
      ~$ npm install
    - Golang
 - Studio 3T (MongoDB)
 - Docker
 - Artifactory (Docker)
 - Jenkins (Docker)
 - Kubernetes (Docker)
 - Kibana (visualize data)
 - Grafana (visualize system)
```

---

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project.

## Building and Running
  1) This project does NOT have to be located in the GOPATH/src directory
  2) To make sure you have all the packages for Go
```
go get ./...
```
  3) Add a debug configuration file to vscode with this info:
     + click the **debug**, then select from the dropdown next to the *play* button: ***Add Configuration***
```
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "DEBUG",
            "type": "go",
            "request": "launch",
            "mode": "auto",
            // "program": "${fileDirname}",
            "program": "${workspaceFolder}/src/go/server.go",
            "env": {
                "ENV": "DEBUG",
                "PORT": "8081",
                "TRACE_LEVEL": "",
                // "CA_BUNDLE_PATH": "/cabundle.pem",
                // "API_URL": "http://localhost:8080/",
                // "API_BASIC_AUTH": "",
                "BASE_API_URL": "http://localhost:8081/",
                // "SSO_AUTH_URL": "https://sso.{YOUR_NAME_HERE}.com/as/authorization.oauth2?",
                // "SSO_TOKEN_URL": "https://sso.{YOUR_NAME_HERE}.com/as/token.oauth2?",
                // "SSO_CLIENTID": "",
                // "SSO_CLIENTSECRET": "",
                "MDB_NAME": "{TABLE_NAME}",
                "MDB_URL": "localhost:27017",
                "HTTP_CONNECTION_TIMEOUT_MS": "2000",
                "WORKROOT": "${workspaceFolder}/dist"
            },
            "args": []
        },
    ]
}
```
  4) ask someone for the cabundle.pem file, add it to the root of the
  5) Get and Setup Docker (just get Docker Desktop, it's easiest method)
     + https://www.docker.com/products/docker-desktop
  6) Using Docker, get Mongo:
     1) PLEASE NOTE: To get this project running and work with the Frontend, you DO NOT need Mongo at all
```
docker pull mongo
```
  7) Add these to your .bash_profile, to make using it easier later :)
```
export GOPATH=$HOME/go
export PATH=$PATH:$GOPATH/bin
# change vim to your editor of choice (use 'code' for vs code)
alias profile='vim ~/.bash_profile'
alias profileupdate='. ~/.bash_profile'
alias newMongoDB='docker run --name mTest -d -p 27017:27017 mongo'
alias startMongo='docker restart mTest'
alias stopMongo='docker stop mTest'
```
  8) Initialize/start your mongodb docker container. Then anytime later, use startMongo/stopMongo
```
newMongoDB
```
  9) Get Studio 3T to easily populate your collections with test data
     + ask for help getting access to DEV collections

  10) Run via ***Debugger***
      + select *DEBUG*, choose *LOCAL*, press *Play*

  11) Go to `http://localhost:8081/` in a web browser

---
