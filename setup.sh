# Copyright 2022 Hewlett Packard Enterprise Development LP.
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be included
# in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
# IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
# CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
# TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
# SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

#!/bin/bash

### !!IMPORTANT - Script currently does not work (is incomplete), follow steps on README instead!! ###
# TODO needs to be to fixed before working:
#   - Figure out how to replace values in docker-compose yaml file
#   - make sure docker version is up to date
#   - change docker login azure with --tenant-id flag set 

# Dependencies
# - Azure CLI
# - Docker
if ! command -v docker &> /dev/null
then
    echo "docker not installed! see: https://docs.docker.com/get-docker"
    exit
fi

if ! command -v az &> /dev/null
then
    echo "azure cli not installed! see: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit
fi

# login to azure cli
az login

# set to 0 to turn off init step
INIT=1

if [ "$INIT" -eq 1 ]; then
        # query user for required environment variables
        echo "Enter your IotHub Connection String: "
        read iothubConnectionString
        echo "Enter your Event Hub Consumer Group: "
        read eventHubConsumerGroup
        echo "Enter your Database Host: "
        read dbServer
        echo "Enter your Database User: "
        read dbUsername
        echo "Enter your Database Password: "
        read dbPassword
        echo "Enter your Database: "
        read db
        echo "Enter your desired Database resource group: "
        read dbRg
        echo -e "IotHubConnectionString='$iothubConnectionString'\nEventHubConsumerGroup='$eventHubConsumerGroup'\nDBHOST='$dbServer'\nDBUSER='$dbUsername'\nDBPASSWORD='$dbPassword'\nDATABASE='$db'" > .env

        # create resource group
        az group create --name $dbRg --location westus

        # Set up your Azure database for postgreSQL
        # OPTIONAL: if you have multiple azure subscriptions, run this command to set the one you wish to use: az account set --subscription <subscription id>
        az extension add --name db-up
        az postgres up -g $dbRg -s $dbServer -d $db -u $dbUsername -p $dbPassword

        # Setup timescaledb for azure database for postgres
        az postgres server configuration set --resource-group $dbRg ––server-name $dbServer --name shared_preload_libraries --value timescaledb
        az postgres server restart --resource-group $dbRg --name $dbServer
fi

# TODO: ensure that env file 1) exists and 2) is not empty
#if ! [ -f ".env" ]; then
#    echo "$FILE exists."
#fi

cat .env

# WEB APP
# build backend image
docker context use default
docker build --file=backend/Dockerfile -t aos8-iot-server-example-azure_app-backend .
#az group create --name myResourceGroup --location eastus
#az acr create --resource-group myResourceGroup --name <acrName> --sku Basic
az acr login --name webappbackendacr
docker tag aos8-iot-server-example-azure_app-backend webappbackendacr.azurecr.io/aos8-iot-server-example-azure_app-backend:v1
docker push webappbackendacr.azurecr.io/aos8-iot-server-example-azure_app-backend:v1

az acr login --name webappfrontendacr
docker compose down
docker context use default
docker-compose down
docker-compose up --build -d
docker-compose push
docker context use webappacicontext
docker compose up
docker ps
