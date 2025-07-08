#!/bin/bash
# Deploy to Azure Container Instances

# Configuration
RESOURCE_GROUP="sdd-mcp-rg"
LOCATION="eastus"
CONTAINER_NAME="sdd-mcp-server"
REGISTRY_NAME="sddmcpregistry"
DOMAIN="yourdomain.com"  # Replace with your domain

echo "🚀 Deploying SDD MCP Server to Azure"

# 1. Create resource group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# 2. Create container registry
echo "🏗️ Creating container registry..."
az acr create --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME --sku Basic

# 3. Build and push image
echo "🏗️ Building container..."
az acr build --registry $REGISTRY_NAME \
  --image $CONTAINER_NAME:latest .

# 4. Create container instance
echo "🚀 Deploying container..."
az container create \
  --resource-group $RESOURCE_GROUP \
  --name $CONTAINER_NAME \
  --image $REGISTRY_NAME.azurecr.io/$CONTAINER_NAME:latest \
  --cpu 1 \
  --memory 1 \
  --registry-login-server $REGISTRY_NAME.azurecr.io \
  --registry-username $(az acr credential show --resource-group $RESOURCE_GROUP --name $REGISTRY_NAME --query username -o tsv) \
  --registry-password $(az acr credential show --resource-group $RESOURCE_GROUP --name $REGISTRY_NAME --query passwords[0].value -o tsv) \
  --dns-name-label sdd-mcp-server \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
    AI_PROVIDER=openai \
    AI_MODEL=gpt-4.1-mini-2025-04-14 \
  --secure-environment-variables \
    OPENAI_API_KEY=$OPENAI_API_KEY \
    SDD_API_KEY=$SDD_API_KEY

# 5. Get the FQDN
FQDN=$(az container show --resource-group $RESOURCE_GROUP --name $CONTAINER_NAME --query ipAddress.fqdn -o tsv)
echo "✅ Deployed to: http://$FQDN:3000"

# 6. For custom domain with App Service (better for production)
echo "🌐 For custom domain with SSL:"
echo "   Consider using Azure App Service instead:"
echo "   az webapp create --name $CONTAINER_NAME --resource-group $RESOURCE_GROUP --plan myAppServicePlan"
echo "   az webapp config hostname add --webapp-name $CONTAINER_NAME --resource-group $RESOURCE_GROUP --hostname $DOMAIN"