# JSON Tools

Azure Functions API providing JSON manipulation operations for Nintex Cloud Automation CE. Handles schema generation, serialization/deserialization, object merging, property manipulation, and XML conversion.

## Operations

- Generate JSON schemas from JSON strings (supports nested objects and arrays)
- Serialize objects to JSON strings
- Deserialize JSON strings to objects with optional validation
- Merge JSON objects or populate text templates with data
- Join two JSON objects into one
- Add properties to existing JSON objects
- Convert JSON to XML format

## API Documentation

Complete API specifications are available via OpenAPI/Swagger:
- Local development: `http://localhost:7071/api/swagger.json`
- Production: `https://your-function-app.azurewebsites.net/api/swagger.json`

## Deployment

### Quick Deploy with PowerShell

```powershell
# Create resource group
az group create --name json-tools-rg --location eastus

# Create storage account
az storage account create --name jsontoolsstorage --location eastus --resource-group json-tools-rg --sku Standard_LRS

# Create Function App
az functionapp create --resource-group json-tools-rg --consumption-plan-location eastus --runtime node --runtime-version 18 --functions-version 4 --name json-tools-api --storage-account jsontoolsstorage

# Deploy
func azure functionapp publish json-tools-api
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions and alternative deployment methods.

## Nintex Integration

Configure Nintex Cloud Automation CE to use this API:

1. Deploy to Azure Functions and obtain the function app URL
2. Get the master key: `az functionapp keys list --name json-tools-api --resource-group json-tools-rg`
3. Import the OpenAPI specification into Nintex using the `/swagger.json` endpoint
4. Configure authentication using the `x-functions-key` header with your master key

All operational endpoints use `authLevel: 'admin'` requiring Azure Functions master key authentication. Swagger documentation endpoints (`/swagger.json`) use anonymous access.

## Configuration

### Environment Variables

Local development (`local.settings.json`):
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

Production settings are configured through Azure Functions application settings.

### Authentication

All operational endpoints require Azure Functions master key authentication via the `x-functions-key` header:

```bash
curl -H "x-functions-key: YOUR_MASTER_KEY" \
     -X POST "https://your-function-app.azurewebsites.net/api/serialize" \
     -H "Content-Type: application/json" \
     -d '{"object": {"test": "data"}}'
```

Swagger documentation endpoints use anonymous access.

### Request Parameters

Each endpoint accepts specific JSON parameters. Common patterns:

- **Generate Schema**: Direct JSON or `{"sample": "json-string"}` format
- **Serialize**: `{"object": any-object}`
- **Deserialize**: `{"value": "json-string", "sample": "schema-json"}` (sample optional)
- **Merge**: `{"template": "text-with-{{placeholders}}", "data": "json-string"}` or object merging
- **Join**: `{"first": "json-string", "second": "json-string"}`
- **Add Property**: `{"json": "json-string", "key": "property-name", "value": any-value}`
- **To XML**: `{"serializedJson": "json-string", "encode": boolean}`

## Architecture

- **Runtime**: Node.js 18, Azure Functions v4
- **Language**: TypeScript
- **Framework**: Azure Functions Programming Model v4
- **Dependencies**: Minimal - only `@azure/functions` for runtime

### Technology Stack

- Azure Functions (Consumption Plan)
- TypeScript compilation with `tsc`
- OpenAPI 2.0 specification for API documentation
- Function-level authentication using Azure Functions keys

### Key Components

- `src/index.ts` - Functions host configuration
- `src/functions/*.ts` - Individual function endpoints
- `swagger.json` - OpenAPI specification for Nintex integration
- `host.json` - Azure Functions host configuration

## Monitoring

### Health Checks

Functions provide standard Azure Functions health monitoring. Application Insights is configured in `host.json` with sampling enabled.

### Common Issues

**Authentication Errors (401)**
- Verify `x-functions-key` header is included
- Use master key for admin-level endpoints
- Check key format and validity

**Invalid JSON Errors (400)**
- Validate request body is proper JSON
- Ensure required parameters are included
- Check parameter names match endpoint specifications

**Function Not Found (404)**
- Verify endpoint URL includes `/api/` prefix
- Check function name matches route configuration

## Project Structure

```
json-tools/
├── src/
│   ├── index.ts                 # Function app configuration
│   └── functions/
│       ├── GenerateSchema.ts    # JSON schema generation
│       ├── Serialize.ts         # Object to JSON conversion
│       ├── Deserialize.ts       # JSON to object conversion
│       ├── Merge.ts             # Template merging and object joining
│       ├── Join.ts              # JSON object combining
│       ├── AddProperty.ts       # Dynamic property addition
│       ├── ToXml.ts             # JSON to XML conversion
│       ├── SwaggerJson.ts       # OpenAPI specification endpoint
│       └── SwaggerUI.ts         # Swagger UI endpoint
├── host.json                    # Azure Functions configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
└── swagger.json                # OpenAPI 2.0 specification
```

## Related Documentation

- [API_EXAMPLES.md](API_EXAMPLES.md) - Detailed endpoint usage examples
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment instructions and troubleshooting
- [CONFIGURATION.md](CONFIGURATION.md) - Environment and application configuration
- [TESTING.md](TESTING.md) - Testing procedures and validation