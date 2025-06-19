# JSON Tools API - Deployment Guide

## Overview
This Azure Functions application provides a comprehensive JSON manipulation API with full Nintex Xtensions compatibility. All endpoints have been migrated from the original Prismatic-based implementation and are ready for deployment.

## Implemented Endpoints

### Core Endpoints
1. **POST /api/generate-schema** - Generate JSON schema from JSON string
2. **POST /api/serialize** - Convert objects to JSON strings
3. **POST /api/deserialize** - Convert JSON strings to objects with optional validation
4. **POST /api/merge** - Merge data with templates (object or text with placeholders)
5. **POST /api/join** - Join two JSON objects into one
6. **POST /api/add-property** - Add a property to a JSON object
7. **POST /api/to-xml** - Convert JSON to XML format with optional encoding

### Additional Endpoints
- **GET /api/swagger.json** - OpenAPI/Swagger specification
- **GET /api/swagger** - Swagger UI interface

## Security Configuration
- All endpoints use `authLevel: 'admin'` requiring Azure Functions keys
- Swagger.json configured with `x-functions-key` header for Azure Functions compatibility
- No custom authentication - relies on Azure Functions built-in security

## Deployment Options

### Option 1: Azure VS Code Extension (Recommended)
1. Open VS Code with Azure Functions extension
2. Right-click on the project folder
3. Select "Deploy to Function App..."
4. Follow the prompts to create or select a Function App
5. Extension will handle build and deployment automatically

### Option 2: Azure CLI
```powershell
# Login to Azure
az login

# Create resource group (if needed)
az group create --name json-tools-rg --location eastus

# Create storage account
az storage account create --name jsontoolsstorage --location eastus --resource-group json-tools-rg --sku Standard_LRS

# Create Function App
az functionapp create --resource-group json-tools-rg --consumption-plan-location eastus --runtime node --runtime-version 18 --functions-version 4 --name json-tools-api --storage-account jsontoolsstorage

# Deploy the function
cd "c:\Users\PoulieJ\repos\solutions-squad\json-tools"
npm run build
func azure functionapp publish json-tools-api
```

### Option 3: PowerShell with Azure PowerShell
```powershell
# Connect to Azure
Connect-AzAccount

# Set variables
$resourceGroupName = "json-tools-rg"
$functionAppName = "json-tools-api"
$storageAccountName = "jsontoolsstorage" + (Get-Random -Maximum 10000)
$location = "East US"

# Create resource group
New-AzResourceGroup -Name $resourceGroupName -Location $location

# Create storage account
New-AzStorageAccount -ResourceGroupName $resourceGroupName -Name $storageAccountName -Location $location -SkuName Standard_LRS

# Create Function App
New-AzFunctionApp -ResourceGroupName $resourceGroupName -Name $functionAppName -StorageAccountName $storageAccountName -Runtime Node -RuntimeVersion 18 -FunctionsVersion 4 -OSType Linux -Location $location

# Build and deploy
cd "c:\Users\PoulieJ\repos\solutions-squad\json-tools"
npm run build
func azure functionapp publish $functionAppName
```

## Post-Deployment Verification

1. **Get Function App URL:**
   ```
   https://<your-function-app-name>.azurewebsites.net
   ```

2. **Test Swagger UI:**
   ```
   https://<your-function-app-name>.azurewebsites.net/api/swagger
   ```

3. **Get API Keys:**
   - Navigate to Azure Portal → Function App → Functions → App Keys
   - Copy the default host key for API access

4. **Test Sample Endpoint:**
   ```powershell
   $headers = @{ "x-functions-key" = "YOUR_FUNCTION_KEY" }
   $body = @{ json = '{"name": "test"}' } | ConvertTo-Json
   Invoke-RestMethod -Uri "https://your-app.azurewebsites.net/api/generate-schema" -Method POST -Headers $headers -Body $body -ContentType "application/json"
   ```

## Environment Configuration

### Required App Settings
- `FUNCTIONS_WORKER_RUNTIME`: `node`
- `WEBSITE_NODE_DEFAULT_VERSION`: `~18`
- `FUNCTIONS_EXTENSION_VERSION`: `~4`

### Optional Settings for Production
- `APPINSIGHTS_INSTRUMENTATIONKEY`: For monitoring
- `WEBSITE_RUN_FROM_PACKAGE`: `1` for package deployment

## API Usage

All endpoints require the `x-functions-key` header with a valid Azure Functions key. The API follows OpenAPI 2.0 specification and is fully compatible with Nintex Workflows.

### Example Request
```http
POST https://your-app.azurewebsites.net/api/serialize
x-functions-key: your-function-key
Content-Type: application/json

{
  "object": {
    "name": "John Doe",
    "age": 30
  }
}
```

### Response
```
{"name":"John Doe","age":30}
```

## Troubleshooting

1. **Build Issues:** Run `npm run build` to check for TypeScript compilation errors
2. **Deployment Issues:** Ensure Azure CLI or PowerShell modules are up to date
3. **Authentication Issues:** Verify function keys are correctly configured
4. **CORS Issues:** Azure Functions CORS is automatically handled for valid origins

## Monitoring

- Use Azure Application Insights for monitoring and logging
- Function execution logs are available in Azure Portal
- Swagger UI provides testing interface at `/api/swagger`

The API is now ready for production deployment and integration with Nintex Workflows.
