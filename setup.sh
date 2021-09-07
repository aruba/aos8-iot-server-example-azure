#!/bin/bash

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

INIT="true"

if [ "$INIT" -eq "true" ]; then
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
        echo "Enter your Database resource group: "
        read dbRg
        echo "IotHubConnectionString=$iothubConnectionString\nEventHubConsumerGroup=$eventHubConsumerGroup\nDBHOST=$dbServer\nDBUSER=$dbUsername\nDBPASSWORD=$dbPassword\nDATABASE=$db" > .env

        # login to azure cli
        az login

        # Set up your Azure database for postgreSQL
        # OPTIONAL: if you have multiple azure subscriptions, run this command to set the one you wish to use: az account set --subscription <subscription id>
        az extension add --name db-up
        az postgres up -g $dbRg -s $dbServer -d $db -u $dbUsername -p $dbPassword

        # Setup timescaledb for azure database for postgres
        az postgres server configuration set --resource-group $dbRg ––server-name $dbServer --name shared_preload_libraries --value timescaledb
        az postgres server restart --resource-group $dbRg --name $dbServer
fi

cat .env

# WEB APP
# build backend image
docker build --file=backend/Dockerfile -t aos8-iot-server-example-azure_app-backend .
#az group create --name myResourceGroup --location eastus
#az acr create --resource-group myResourceGroup --name <acrName> --sku Basic
az acr login --name webappbackendacr
docker tag aos8-iot-server-example-azure_app-backend webappbackendacr.azurecr.io/aos8-iot-server-example-azure_app-backend:v1
docker context use default
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
