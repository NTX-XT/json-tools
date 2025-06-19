# Configuration Guide

This document provides comprehensive information about configuring the JSON Tools API for different environments, including local development, staging, and production deployments.

## Table of Contents

- [Environment Configuration](#environment-configuration)
- [Azure Functions Configuration](#azure-functions-configuration)
- [Authentication & Security](#authentication--security)
- [Performance Tuning](#performance-tuning)
- [Logging Configuration](#logging-configuration)
- [Deployment Configuration](#deployment-configuration)
- [Troubleshooting Configuration Issues](#troubleshooting-configuration-issues)

## Environment Configuration

### Local Development (`local.settings.json`)

Create a `local.settings.json` file in the project root for local development:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AzureWebJobsFeatureFlags": "EnableWorkerIndexing",
    "AZURE_FUNCTIONS_ENVIRONMENT": "Development"
  },
  "Host": {
    "LocalHttpPort": 7071,
    "CORS": "*",
    "CORSCredentials": false
  },
  "ConnectionStrings": {}
}
```

### Production Environment Variables

When deploying to Azure, configure these application settings:

| Setting | Value | Description |
|---------|-------|-------------|
| `FUNCTIONS_WORKER_RUNTIME` | `node` | Specifies Node.js runtime |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~18` | Node.js version |
| `FUNCTIONS_EXTENSION_VERSION` | `~4` | Azure Functions runtime version |
| `AzureWebJobsStorage` | `DefaultEndpointsProtocol=https;...` | Storage account connection string |
| `WEBSITE_RUN_FROM_PACKAGE` | `1` | Run from deployment package |

### Environment-Specific Configuration

#### Development
```json
{
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_FUNCTIONS_ENVIRONMENT": "Development",
    "WEBSITE_CORS_ALLOWED_ORIGINS": "*",
    "WEBSITE_CORS_SUPPORT_CREDENTIALS": "false"
  }
}
```

#### Staging
```json
{
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_FUNCTIONS_ENVIRONMENT": "Staging",
    "WEBSITE_CORS_ALLOWED_ORIGINS": "https://staging.nintex.com,https://staging-app.example.com",
    "WEBSITE_CORS_SUPPORT_CREDENTIALS": "true"
  }
}
```

#### Production
```json
{
  "Values": {
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_FUNCTIONS_ENVIRONMENT": "Production",
    "WEBSITE_CORS_ALLOWED_ORIGINS": "https://nintex.com,https://app.example.com",
    "WEBSITE_CORS_SUPPORT_CREDENTIALS": "true",
    "WEBSITE_ENABLE_SYNC_UPDATE_SITE": "true"
  }
}
```

## Azure Functions Configuration

### Host Configuration (`host.json`)

The `host.json` file configures the Azure Functions host:

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "excludedTypes": "Request"
      }
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "functionTimeout": "00:05:00",
  "http": {
    "routePrefix": "api",
    "maxOutstandingRequests": 200,
    "maxConcurrentRequests": 100
  }
}
```

### Advanced Host Configuration

For production environments with high load:

```json
{
  "version": "2.0",
  "logging": {
    "applicationInsights": {
      "samplingSettings": {
        "isEnabled": true,
        "maxTelemetryItemsPerSecond": 20,
        "excludedTypes": "Request"
      }
    },
    "logLevel": {
      "default": "Information",
      "Host.Results": "Error",
      "Function": "Error",
      "Host.Aggregator": "Trace"
    }
  },
  "extensionBundle": {
    "id": "Microsoft.Azure.Functions.ExtensionBundle",
    "version": "[4.*, 5.0.0)"
  },
  "functionTimeout": "00:10:00",
  "http": {
    "routePrefix": "api",
    "maxOutstandingRequests": 500,
    "maxConcurrentRequests": 200,
    "dynamicThrottlesEnabled": true
  },
  "healthMonitor": {
    "enabled": true,
    "healthCheckInterval": "00:00:10",
    "healthCheckWindow": "00:02:00",
    "healthCheckThreshold": 6,
    "counterThreshold": 0.80
  }
}
```

## Authentication & Security

### Function-Level Authentication

All endpoints use `authLevel: 'admin'` by default:

```typescript
app.http('GenerateSchema', {
    methods: ['POST'],
    authLevel: 'admin',  // Requires function or master key
    route: 'generate-schema',
    handler: GenerateSchema
});
```

### Authentication Levels

| Level | Description | Use Case |
|-------|-------------|----------|
| `anonymous` | No authentication required | Public APIs |
| `function` | Requires function-specific key | Most common |
| `admin` | Requires master key | Administrative functions |

### CORS Configuration

Configure CORS for web applications:

```json
{
  "Host": {
    "CORS": {
      "allowedOrigins": [
        "https://nintex.com",
        "https://app.example.com"
      ],
      "allowedMethods": [
        "GET",
        "POST",
        "OPTIONS"
      ],
      "allowedHeaders": [
        "Content-Type",
        "x-functions-key",
        "Authorization"
      ],
      "allowCredentials": true,
      "maxAge": 86400
    }
  }
}
```

### API Key Management

#### Getting Function Keys

**Via Azure CLI:**
```bash
# Get master key
az functionapp keys list --name your-function-app --resource-group your-rg

# Get function-specific key
az functionapp function keys list --name your-function-app --resource-group your-rg --function-name GenerateSchema
```

**Via PowerShell:**
```powershell
# Get master key using the provided script
.\Get-Master-Key.ps1 -ResourceGroupName "your-rg" -FunctionAppName "your-function-app"
```

#### Using Keys in Requests

**Header-based authentication:**
```bash
curl -X POST "https://your-app.azurewebsites.net/api/generate-schema" \
  -H "Content-Type: application/json" \
  -H "x-functions-key: YOUR_FUNCTION_KEY" \
  -d '{"test": "data"}'
```

**Query parameter authentication:**
```bash
curl -X POST "https://your-app.azurewebsites.net/api/generate-schema?code=YOUR_FUNCTION_KEY" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Performance Tuning

### Function App Settings

Optimize performance with these settings:

```json
{
  "Values": {
    "WEBSITE_NODE_DEFAULT_VERSION": "~18",
    "WEBSITE_RUN_FROM_PACKAGE": "1",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "FUNCTIONS_WORKER_RUNTIME_VERSION": "~18",
    "WEBSITE_ENABLE_SYNC_UPDATE_SITE": "true",
    "WEBSITE_CONTENTOVERVNET": "1",
    "WEBSITE_VNET_ROUTE_ALL": "1"
  }
}
```

### Memory and CPU Configuration

For high-throughput scenarios:

```json
{
  "Values": {
    "FUNCTIONS_WORKER_PROCESS_COUNT": "10",
    "WEBSITE_MAX_DYNAMIC_APPLICATION_SCALE_OUT": "20",
    "WEBSITE_DYNAMIC_CACHE": "1"
  }
}
```

### Connection Pool Settings

Optimize for concurrent requests:

```json
{
  "http": {
    "maxOutstandingRequests": 1000,
    "maxConcurrentRequests": 500,
    "dynamicThrottlesEnabled": true
  }
}
```

## Logging Configuration

### Application Insights Integration

Enable comprehensive monitoring:

```json
{
  "Values": {
    "APPINSIGHTS_INSTRUMENTATIONKEY": "your-instrumentation-key",
    "APPLICATIONINSIGHTS_CONNECTION_STRING": "InstrumentationKey=your-key;IngestionEndpoint=https://your-region.in.applicationinsights.azure.com/",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

### Log Levels

Configure logging detail:

```json
{
  "logging": {
    "logLevel": {
      "default": "Information",
      "Host.Results": "Error",
      "Function.GenerateSchema": "Debug",
      "Function.Serialize": "Information",
      "Host.Aggregator": "Trace"
    }
  }
}
```

### Custom Logging

Add structured logging to functions:

```typescript
// In function code
context.log('Processing request', {
    endpoint: 'generate-schema',
    requestSize: requestBody.length,
    timestamp: new Date().toISOString()
});
```

## Deployment Configuration

### Azure DevOps Pipeline Configuration

Create `azure-pipelines.yml`:

```yaml
trigger:
- main

pool:
  vmImage: 'ubuntu-latest'

variables:
  azureSubscription: 'your-subscription-connection'
  functionAppName: 'json-tools-api'
  resourceGroupName: 'json-tools-rg'

stages:
- stage: Build
  jobs:
  - job: BuildJob
    steps:
    - task: NodeTool@0
      inputs:
        versionSpec: '18.x'
      displayName: 'Install Node.js'
    
    - script: |
        npm install
        npm run build
      displayName: 'Install dependencies and build'
    
    - task: ArchiveFiles@2
      inputs:
        rootFolderOrFile: '$(System.DefaultWorkingDirectory)'
        includeRootFolder: false
        archiveFile: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
      displayName: 'Archive files'
    
    - task: PublishBuildArtifacts@1
      inputs:
        pathToPublish: '$(Build.ArtifactStagingDirectory)/$(Build.BuildId).zip'
        artifactName: 'drop'

- stage: Deploy
  dependsOn: Build
  jobs:
  - deployment: DeployJob
    environment: 'production'
    strategy:
      runOnce:
        deploy:
          steps:
          - task: AzureFunctionApp@1
            inputs:
              azureSubscription: '$(azureSubscription)'
              appType: 'functionApp'
              appName: '$(functionAppName)'
              package: '$(Pipeline.Workspace)/drop/$(Build.BuildId).zip'
              deploymentMethod: 'zipDeploy'
```

### GitHub Actions Configuration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Azure Functions

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

env:
  AZURE_FUNCTIONAPP_NAME: 'json-tools-api'
  AZURE_FUNCTIONAPP_PACKAGE_PATH: '.'
  NODE_VERSION: '18.x'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - name: 'Checkout GitHub Action'
      uses: actions/checkout@v3

    - name: Setup Node ${{ env.NODE_VERSION }} Environment
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}

    - name: 'Resolve Project Dependencies Using NPM'
      shell: bash
      run: |
        pushd './${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}'
        npm install
        npm run build --if-present
        popd

    - name: 'Run Azure Functions Action'
      uses: Azure/functions-action@v1
      id: fa
      with:
        app-name: ${{ env.AZURE_FUNCTIONAPP_NAME }}
        package: ${{ env.AZURE_FUNCTIONAPP_PACKAGE_PATH }}
        publish-profile: ${{ secrets.AZURE_FUNCTIONAPP_PUBLISH_PROFILE }}
```

### Infrastructure as Code (ARM Template)

Create `infrastructure/template.json`:

```json
{
    "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#",
    "contentVersion": "1.0.0.0",
    "parameters": {
        "functionAppName": {
            "type": "string",
            "defaultValue": "json-tools-api"
        },
        "storageAccountName": {
            "type": "string",
            "defaultValue": "jsontoolsstorage"
        },
        "location": {
            "type": "string",
            "defaultValue": "[resourceGroup().location]"
        }
    },
    "variables": {
        "hostingPlanName": "[concat(parameters('functionAppName'), '-plan')]"
    },
    "resources": [
        {
            "type": "Microsoft.Storage/storageAccounts",
            "apiVersion": "2021-09-01",
            "name": "[parameters('storageAccountName')]",
            "location": "[parameters('location')]",
            "sku": {
                "name": "Standard_LRS"
            },
            "kind": "Storage"
        },
        {
            "type": "Microsoft.Web/serverfarms",
            "apiVersion": "2021-03-01",
            "name": "[variables('hostingPlanName')]",
            "location": "[parameters('location')]",
            "sku": {
                "name": "Y1",
                "tier": "Dynamic"
            }
        },
        {
            "type": "Microsoft.Web/sites",
            "apiVersion": "2021-03-01",
            "name": "[parameters('functionAppName')]",
            "location": "[parameters('location')]",
            "kind": "functionapp",
            "dependsOn": [
                "[resourceId('Microsoft.Web/serverfarms', variables('hostingPlanName'))]",
                "[resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName'))]"
            ],
            "properties": {
                "serverFarmId": "[resourceId('Microsoft.Web/serverfarms', variables('hostingPlanName'))]",
                "siteConfig": {
                    "appSettings": [
                        {
                            "name": "AzureWebJobsStorage",
                            "value": "[concat('DefaultEndpointsProtocol=https;AccountName=', parameters('storageAccountName'), ';EndpointSuffix=', environment().suffixes.storage, ';AccountKey=',listKeys(resourceId('Microsoft.Storage/storageAccounts', parameters('storageAccountName')), '2021-09-01').keys[0].value)]"
                        },
                        {
                            "name": "FUNCTIONS_WORKER_RUNTIME",
                            "value": "node"
                        },
                        {
                            "name": "FUNCTIONS_EXTENSION_VERSION",
                            "value": "~4"
                        },
                        {
                            "name": "WEBSITE_NODE_DEFAULT_VERSION",
                            "value": "~18"
                        }
                    ]
                }
            }
        }
    ]
}
```

## Troubleshooting Configuration Issues

### Common Configuration Problems

#### Issue: Functions not starting locally
**Solution:**
1. Check `local.settings.json` exists and is valid JSON
2. Verify Azure Functions Core Tools are installed
3. Ensure Node.js version is 18+

#### Issue: CORS errors in browser
**Solution:**
```json
{
  "Host": {
    "CORS": "*",
    "CORSCredentials": false
  }
}
```

#### Issue: Authentication failures
**Solution:**
1. Verify function key is correct
2. Check authLevel in function definition
3. Ensure x-functions-key header is set

#### Issue: Slow performance
**Solution:**
1. Enable Application Insights
2. Increase maxConcurrentRequests
3. Use Premium plan for consistent performance

### Diagnostic Commands

**Check function status:**
```bash
func --version
func host start --verbose
```

**Validate configuration:**
```bash
# Validate host.json
cat host.json | jq .

# Validate local.settings.json
cat local.settings.json | jq .
```

**Test connectivity:**
```bash
# Test local endpoint
curl http://localhost:7071/api/swagger.json

# Test deployed endpoint
curl https://your-app.azurewebsites.net/api/swagger.json
```

### Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `FUNCTIONS_WORKER_RUNTIME` | Runtime language | `node` |
| `WEBSITE_NODE_DEFAULT_VERSION` | Node.js version | `~18` |
| `AzureWebJobsStorage` | Storage connection | Connection string |
| `FUNCTIONS_EXTENSION_VERSION` | Runtime version | `~4` |
| `WEBSITE_CONTENTAZUREFILECONNECTIONSTRING` | Content storage | Connection string |
| `WEBSITE_CONTENTSHARE` | Content share name | Function app name |
| `APPINSIGHTS_INSTRUMENTATIONKEY` | Monitoring | Instrumentation key |

This configuration guide ensures your JSON Tools API is properly configured for all environments and use cases.
