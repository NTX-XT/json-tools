# JSON Tools API

A comprehensive Azure Functions-based JSON manipulation API designed for Nintex Workflows and general-purpose JSON operations. This API provides essential JSON processing capabilities including schema generation, serialization, deserialization, merging, and XML conversion.

## 🚀 Features

- **Generate JSON Schema** - Create comprehensive JSON schema definitions from any JSON string
- **Serialize/Deserialize** - Convert between objects and JSON strings with validation
- **Merge & Join** - Combine JSON objects and merge data with templates
- **Add Properties** - Dynamically add properties to JSON objects
- **XML Conversion** - Transform JSON to XML format
- **Nintex Integration** - Full compatibility with Nintex Xtensions and workflow automation
- **OpenAPI Documentation** - Complete Swagger/OpenAPI specification included

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Usage Examples](#usage-examples)
- [Local Development](#local-development)
- [Deployment](#deployment)
- [Nintex Integration](#nintex-integration)
- [API Reference](#api-reference)

## ⚡ Quick Start

### Prerequisites
- Node.js 18+ 
- Azure Functions Core Tools
- Azure Functions extension for VS Code (recommended)

### Installation
```bash
git clone <repository-url>
cd json-tools
npm install
```

### Run Locally
```bash
npm start
```

The API will be available at `http://localhost:7071/api`

### Test an Endpoint
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 30, "active": true}'
```

## 🔗 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate-schema` | POST | Generate JSON schema from JSON string |
| `/serialize` | POST | Convert object to JSON string |
| `/deserialize` | POST | Convert JSON string to object with validation |
| `/merge` | POST | Merge data with templates (object or text placeholders) |
| `/join` | POST | Join two JSON objects into one |
| `/add-property` | POST | Add a property to a JSON object |
| `/to-xml` | POST | Convert JSON to XML format |
| `/swagger.json` | GET | OpenAPI specification |

## 💡 Usage Examples

### Generate Schema
Create a JSON schema definition from any JSON structure:

```bash
# Basic schema generation
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com", "age": 30}'
```

**Response:**
```json
{
  "schema": {
    "type": "object",
    "properties": {
      "name": {
        "name": "name",
        "title": "name",
        "description": null,
        "readonly": false,
        "type": "string"
      },
      "email": {
        "name": "email",
        "title": "email", 
        "description": null,
        "readonly": false,
        "type": "string"
      },
      "age": {
        "name": "age",
        "title": "age",
        "description": null,
        "readonly": false,
        "type": "string"
      }
    }
  }
}
```

### Using Sample Property
For dynamic schema generation in workflows:

```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"sample": "{\"product\": \"widget\", \"price\": 29.99, \"inStock\": true}"}'
```

### Serialize Object
Convert objects to JSON strings:

```bash
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{"object": {"user": {"id": 123, "name": "Alice"}}}'
```

**Response:**
```json
"{\"user\":{\"id\":123,\"name\":\"Alice\"}}"
```

### Deserialize JSON
Convert JSON strings back to objects:

```bash
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{"value": "{\"name\":\"Bob\",\"age\":25}", "sample": "{\"name\":\"string\",\"age\":0}"}'
```

### Merge with Template
Combine data with templates using placeholders:

```bash
curl -X POST "http://localhost:7071/api/merge" \
  -H "Content-Type: application/json" \
  -d '{"template": "Hello {{name}}, you are {{age}} years old!", "data": "{\"name\":\"Sarah\",\"age\":28}"}'
```

### Join Objects
Merge two JSON objects:

```bash
curl -X POST "http://localhost:7071/api/join" \
  -H "Content-Type: application/json" \
  -d '{"first": "{\"name\":\"John\",\"age\":30}", "second": "{\"city\":\"New York\",\"country\":\"USA\"}"}'
```

### Add Property
Dynamically add properties to JSON objects:

```bash
curl -X POST "http://localhost:7071/api/add-property" \
  -H "Content-Type: application/json" \
  -d '{"json": "{\"name\":\"John\"}", "key": "email", "value": "john@example.com"}'
```

### Convert to XML
Transform JSON to XML format:

```bash
curl -X POST "http://localhost:7071/api/to-xml" \
  -H "Content-Type: application/json" \
  -d '{"serializedJson": "{\"user\":{\"name\":\"John\",\"age\":30}}", "encode": false}'
```

## 🛠 Local Development

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Available Scripts
```bash
npm run build      # Compile TypeScript to JavaScript
npm run watch      # Watch mode for development
npm run clean      # Clean the dist folder
npm start          # Start Azure Functions host
```

### Testing Endpoints
The API includes a Swagger UI for interactive testing:
- **Swagger JSON**: `http://localhost:7071/api/swagger.json`
- **API Documentation**: Use tools like Postman or curl for testing

### Environment Configuration
Create a `local.settings.json` file for local development:
```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  }
}
```

## 🚀 Deployment

### Using VS Code (Recommended)
1. Install the Azure Functions extension
2. Right-click the project folder
3. Select "Deploy to Function App..."
4. Follow the deployment wizard

### Using Azure CLI
```bash
# Create resource group
az group create --name json-tools-rg --location eastus

# Create storage account  
az storage account create --name jsontoolsstorage --location eastus --resource-group json-tools-rg --sku Standard_LRS

# Create Function App
az functionapp create --resource-group json-tools-rg --consumption-plan-location eastus --runtime node --runtime-version 18 --functions-version 4 --name json-tools-api --storage-account jsontoolsstorage

# Deploy
func azure functionapp publish json-tools-api
```

For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 🔧 Nintex Integration

This API is specifically designed for Nintex Workflows with:

- **Nintex Headers**: All endpoints include `x-ntx-summary`, `x-ntx-sublabel` metadata
- **Dynamic Schema**: `/deserialize` endpoint supports dynamic schema generation
- **Tree Control**: Enhanced UI controls for Nintex workflow designer
- **Admin Authentication**: Secure endpoints using Azure Functions keys

### Using in Nintex Workflows
1. Deploy the API to Azure Functions
2. Get the function app URL and access key
3. Use the OpenAPI specification (`/swagger.json`) to import into Nintex
4. Configure authentication with the `x-functions-key` header

### Key Benefits for Nintex
- **Type-safe deserialization** with schema validation
- **Dynamic form generation** using generated schemas  
- **Template-based data merging** for document generation
- **XML conversion** for legacy system integration

## 📚 API Reference

### Authentication
All endpoints require Azure Functions authentication using the `x-functions-key` header:

```bash
curl -H "x-functions-key: YOUR_FUNCTION_KEY" \
     -X POST "https://your-app.azurewebsites.net/api/endpoint"
```

### Error Handling
All endpoints return consistent error responses:

```json
{
  "error": "Description of what went wrong"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing/invalid API key)
- `500` - Internal Server Error

### Content Types
- **Request**: `application/json`
- **Response**: `application/json` (most endpoints) or `text/plain` (serialize, XML)

## 🔍 Advanced Features

### Schema Generation Options
The `/generate-schema` endpoint supports multiple input formats:

1. **Direct JSON**: Send JSON directly in the request body
2. **Sample Property**: Use `{"sample": "json-string"}` for workflow integration
3. **Nested Objects**: Handles complex nested structures and arrays

### Template Merging
The `/merge` endpoint supports two modes:

1. **Object Merging**: Merge JSON objects together
2. **Placeholder Replacement**: Use `{{key}}` syntax for text templates

### Type Handling
- All values are treated as strings by default (`treatAllAsStrings: true`)
- Properties are optional by default (`treatAllAsRequired: false`)
- Supports arrays, objects, and primitive types

## 📄 License

[Add your license information here]

## 🆘 Support

For issues and questions:
1. Check the [API Examples](API_EXAMPLES.md) for detailed usage
2. Review the OpenAPI specification at `/swagger.json`
3. Check the deployment guide in [DEPLOYMENT.md](DEPLOYMENT.md)