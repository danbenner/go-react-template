#!/bin/bash

echo Building go-react-template:build
# Build image; -t is 'tag-list' (format -> 'name:tag'); -f is name of Dockerfile; '.' is currect directory
docker build -t go-react-template:build -f Dockerfile.build .
# Create new container; name = 'extract'; NOTE: unsure of tag
docker create --name extract go-react-template:build
# Copy 'container:sourcePath' 'destination'
docker cp extract:/go/src/go-react-template/app ./app
# 'force' Remove container (even if running)
docker rm -f extract

echo Building artifactory-rco.COMPANY_NAME.com/YOUR_TEAM_NAME_HERE/go-react-template:1.0.0
# Delete previous build of image, to prevent build-up of <none> images
docker rmi -f artifactory-rco.COMPANY_NAME.com/YOUR_TEAM_NAME_HERE/go-react-template:1.0.0
# Build image; Do not use cache; -t (Tag list) -> 'name:tag'; -f is name of Dockerfile
docker build --no-cache -t artifactory-rco.COMPANY_NAME.com/YOUR_TEAM_NAME_HERE/go-react-template:1.0.0 -f Dockerfile.release .
# Remove app (container)
rm ./app
# Remove image
docker rmi go-react-template:build 