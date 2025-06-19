# JSON Tools API - Detailed Examples

This document provides comprehensive examples for every endpoint in the JSON Tools API, including real-world use cases and advanced scenarios.

## Table of Contents

- [Generate Schema Examples](#generate-schema-examples)
- [Serialize Examples](#serialize-examples)
- [Deserialize Examples](#deserialize-examples)
- [Merge Examples](#merge-examples)
- [Join Examples](#join-examples)
- [Add Property Examples](#add-property-examples)
- [XML Conversion Examples](#xml-conversion-examples)
- [Error Handling Examples](#error-handling-examples)
- [Nintex Workflow Examples](#nintex-workflow-examples)

## Generate Schema Examples

### Basic Schema Generation

**Simple Object:**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "age": 30, "active": true}'
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
      "age": {
        "name": "age",
        "title": "age",
        "description": null,
        "readonly": false,
        "type": "string"
      },
      "active": {
        "name": "active",
        "title": "active",
        "description": null,
        "readonly": false,
        "type": "string"
      }
    }
  }
}
```

### Complex Nested Objects

**Employee Record:**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{
    "employee": {
      "id": 12345,
      "personalInfo": {
        "firstName": "Alice",
        "lastName": "Johnson",
        "email": "alice@company.com"
      },
      "department": "Engineering",
      "skills": ["JavaScript", "TypeScript", "Azure"],
      "active": true,
      "startDate": "2023-01-15"
    }
  }'
```

### Array Schema Generation

**Product List:**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '[
    {"id": 1, "name": "Widget A", "price": 29.99, "inStock": true},
    {"id": 2, "name": "Widget B", "price": 39.99, "inStock": false}
  ]'
```

**Response:**
```json
{
  "schema": {
    "type": "array",
    "items": {
      "type": "object",
      "properties": {
        "id": {
          "name": "id",
          "title": "id",
          "description": null,
          "readonly": false,
          "type": "string"
        },
        "name": {
          "name": "name",
          "title": "name",
          "description": null,
          "readonly": false,
          "type": "string"
        },
        "price": {
          "name": "price",
          "title": "price",
          "description": null,
          "readonly": false,
          "type": "string"
        },
        "inStock": {
          "name": "inStock",
          "title": "inStock",
          "description": null,
          "readonly": false,
          "type": "string"
        }
      }
    }
  }
}
```

### Using Sample Property (Workflow Integration)

**For Dynamic Schema in Nintex:**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"sample": "{\"orderId\": \"ORD-001\", \"customerName\": \"John Smith\", \"totalAmount\": 149.99, \"items\": [{\"productId\": \"P001\", \"quantity\": 2}]}"}'
```

## Serialize Examples

### Basic Object Serialization

**User Object:**
```bash
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{
    "object": {
      "user": {
        "id": 123,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "preferences": {
          "theme": "dark",
          "notifications": true
        }
      }
    }
  }'
```

**Response:**
```
"{\"user\":{\"id\":123,\"name\":\"Alice Johnson\",\"email\":\"alice@example.com\",\"preferences\":{\"theme\":\"dark\",\"notifications\":true}}}"
```

### Array Serialization

**Shopping Cart:**
```bash
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{
    "object": {
      "cart": [
        {"productId": "P001", "name": "Laptop", "price": 999.99, "quantity": 1},
        {"productId": "P002", "name": "Mouse", "price": 29.99, "quantity": 2}
      ],
      "total": 1059.97
    }
  }'
```

### Configuration Object

**API Configuration:**
```bash
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{
    "object": {
      "apiConfig": {
        "baseUrl": "https://api.example.com",
        "timeout": 30000,
        "retries": 3,
        "headers": {
          "User-Agent": "MyApp/1.0",
          "Accept": "application/json"
        }
      }
    }
  }'
```

## Deserialize Examples

### Basic Deserialization

**Simple JSON String:**
```bash
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "{\"name\":\"Bob Smith\",\"age\":25,\"email\":\"bob@example.com\"}",
    "sample": "{\"name\":\"string\",\"age\":0,\"email\":\"string\"}"
  }'
```

**Response:**
```json
{
  "name": "Bob Smith",
  "age": 25,
  "email": "bob@example.com"
}
```

### API Response Deserialization

**Processing API Response:**
```bash
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "{\"status\":\"success\",\"data\":{\"users\":[{\"id\":1,\"name\":\"John\"},{\"id\":2,\"name\":\"Jane\"}]},\"timestamp\":\"2025-06-19T10:30:00Z\"}",
    "sample": "{\"status\":\"string\",\"data\":{\"users\":[{\"id\":0,\"name\":\"string\"}]},\"timestamp\":\"string\"}"
  }'
```

### Configuration Deserialization

**App Settings:**
```bash
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "{\"database\":{\"host\":\"localhost\",\"port\":5432,\"name\":\"myapp\"},\"cache\":{\"enabled\":true,\"ttl\":3600}}",
    "sample": "{\"database\":{\"host\":\"string\",\"port\":0,\"name\":\"string\"},\"cache\":{\"enabled\":false,\"ttl\":0}}"
  }'
```

## Merge Examples

### Template with Placeholders

**Email Template:**
```bash
curl -X POST "http://localhost:7071/api/merge" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "Dear {{customerName}}, your order #{{orderId}} for ${{totalAmount}} has been {{status}}. Thank you for your business!",
    "data": "{\"customerName\":\"John Smith\",\"orderId\":\"ORD-12345\",\"totalAmount\":\"149.99\",\"status\":\"shipped\"}"
  }'
```

**Response:**
```
"Dear John Smith, your order #ORD-12345 for $149.99 has been shipped. Thank you for your business!"
```

### Object Merging

**User Profile Merge:**
```bash
curl -X POST "http://localhost:7071/api/merge" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "{\"user\":{\"name\":\"{{userName}}\",\"email\":\"{{userEmail}}\",\"role\":\"user\",\"active\":true}}",
    "data": "{\"userName\":\"Alice Johnson\",\"userEmail\":\"alice@company.com\"}"
  }'
```

### Document Template

**Invoice Template:**
```bash
curl -X POST "http://localhost:7071/api/merge" \
  -H "Content-Type: application/json" \
  -d '{
    "template": "Invoice #{{invoiceNumber}}\nDate: {{invoiceDate}}\nCustomer: {{customerName}}\nAmount: ${{totalAmount}}\nDue: {{dueDate}}",
    "data": "{\"invoiceNumber\":\"INV-2025-001\",\"invoiceDate\":\"2025-06-19\",\"customerName\":\"Acme Corp\",\"totalAmount\":\"2500.00\",\"dueDate\":\"2025-07-19\"}"
  }'
```

## Join Examples

### User Profile Enhancement

**Combine Basic Info with Preferences:**
```bash
curl -X POST "http://localhost:7071/api/join" \
  -H "Content-Type: application/json" \
  -d '{
    "first": "{\"id\":123,\"name\":\"John Doe\",\"email\":\"john@example.com\"}",
    "second": "{\"preferences\":{\"theme\":\"dark\",\"language\":\"en\"},\"lastLogin\":\"2025-06-19T08:30:00Z\"}"
  }'
```

**Response:**
```json
"{\"id\":123,\"name\":\"John Doe\",\"email\":\"john@example.com\",\"preferences\":{\"theme\":\"dark\",\"language\":\"en\"},\"lastLogin\":\"2025-06-19T08:30:00Z\"}"
```

### Configuration Merge

**Base Config + Environment Overrides:**
```bash
curl -X POST "http://localhost:7071/api/join" \
  -H "Content-Type: application/json" \
  -d '{
    "first": "{\"app\":{\"name\":\"MyApp\",\"version\":\"1.0.0\"},\"database\":{\"host\":\"localhost\",\"port\":5432}}",
    "second": "{\"database\":{\"host\":\"prod-db.example.com\",\"ssl\":true},\"cache\":{\"enabled\":true}}"
  }'
```

### Order Processing

**Merge Order with Customer Data:**
```bash
curl -X POST "http://localhost:7071/api/join" \
  -H "Content-Type: application/json" \
  -d '{
    "first": "{\"orderId\":\"ORD-001\",\"items\":[{\"productId\":\"P001\",\"quantity\":2}],\"total\":199.98}",
    "second": "{\"customerId\":\"CUST-123\",\"customerName\":\"Jane Smith\",\"shippingAddress\":{\"street\":\"123 Main St\",\"city\":\"Anytown\"}}"
  }'
```

## Add Property Examples

### Dynamic Property Addition

**Add Status to Order:**
```bash
curl -X POST "http://localhost:7071/api/add-property" \
  -H "Content-Type: application/json" \
  -d '{
    "json": "{\"orderId\":\"ORD-001\",\"customerId\":\"CUST-123\",\"total\":149.99}",
    "key": "status",
    "value": "processing"
  }'
```

**Response:**
```json
"{\"orderId\":\"ORD-001\",\"customerId\":\"CUST-123\",\"total\":149.99,\"status\":\"processing\"}"
```

### Add Complex Object Property

**Add Shipping Information:**
```bash
curl -X POST "http://localhost:7071/api/add-property" \
  -H "Content-Type: application/json" \
  -d '{
    "json": "{\"orderId\":\"ORD-001\",\"total\":149.99}",
    "key": "shipping",
    "value": "{\"method\":\"standard\",\"cost\":9.99,\"estimatedDays\":5}"
  }'
```

### Add Timestamp

**Add Created Timestamp:**
```bash
curl -X POST "http://localhost:7071/api/add-property" \
  -H "Content-Type: application/json" \
  -d '{
    "json": "{\"userId\":123,\"action\":\"login\"}",
    "key": "timestamp",
    "value": "2025-06-19T10:30:00Z"
  }'
```

## XML Conversion Examples

### Basic JSON to XML

**User Profile:**
```bash
curl -X POST "http://localhost:7071/api/to-xml" \
  -H "Content-Type: application/json" \
  -d '{
    "serializedJson": "{\"user\":{\"id\":123,\"name\":\"John Doe\",\"email\":\"john@example.com\"}}",
    "encode": false
  }'
```

**Response:**
```xml
<user><id>123</id><name>John Doe</name><email>john@example.com</email></user>
```

### Complex Object with Arrays

**Product Catalog:**
```bash
curl -X POST "http://localhost:7071/api/to-xml" \
  -H "Content-Type: application/json" \
  -d '{
    "serializedJson": "{\"catalog\":{\"name\":\"Electronics\",\"products\":[{\"id\":1,\"name\":\"Laptop\",\"price\":999.99},{\"id\":2,\"name\":\"Mouse\",\"price\":29.99}]}}",
    "encode": false
  }'
```

### Encoded XML (for Safe Transmission)

**Encoded Output:**
```bash
curl -X POST "http://localhost:7071/api/to-xml" \
  -H "Content-Type: application/json" \
  -d '{
    "serializedJson": "{\"message\":\"Hello <World> & Everyone!\"}",
    "encode": true
  }'
```

## Error Handling Examples

### Invalid JSON Input

**Request:**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'
```

**Response:**
```json
{
  "error": "Invalid JSON string. Unable to analyze."
}
```

### Missing Required Parameters

**Request:**
```bash
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response:**
```json
{
  "error": "Missing required parameter 'object'. Please provide an object to serialize."
}
```

### Authentication Error

**Request without API key:**
```bash
curl -X POST "https://your-app.azurewebsites.net/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

**Response:**
```json
{
  "error": "Unauthorized"
}
```

## Nintex Workflow Examples

### Dynamic Form Generation

**Step 1: Get JSON data from previous workflow action**
**Step 2: Generate schema for dynamic form:**

```json
{
  "sample": "{\"applicantName\": \"string\", \"applicationDate\": \"2025-06-19\", \"requestedAmount\": 50000, \"projectDescription\": \"string\"}"
}
```

**Step 3: Use generated schema to create dynamic form fields**

### Data Transformation Pipeline

**Step 1: Deserialize API response:**
```json
{
  "value": "{{apiResponse}}",
  "sample": "{\"data\": [{\"id\": 0, \"name\": \"string\", \"status\": \"string\"}]}"
}
```

**Step 2: Transform and merge with template:**
```json
{
  "template": "Processing {{count}} items. Status: {{overallStatus}}",
  "data": "{\"count\": \"{{itemCount}}\", \"overallStatus\": \"{{status}}\"}"
}
```

**Step 3: Convert to XML for legacy system:**
```json
{
  "serializedJson": "{{mergedData}}",
  "encode": true
}
```

### Configuration Management

**Merge environment-specific config:**
```json
{
  "first": "{{baseConfig}}",
  "second": "{{environmentOverrides}}"
}
```

**Add deployment metadata:**
```json
{
  "json": "{{mergedConfig}}",
  "key": "deploymentInfo",
  "value": "{\"version\": \"{{version}}\", \"deployedBy\": \"{{deployedBy}}\", \"timestamp\": \"{{timestamp}}\"}"
}
```

## PowerShell Examples

For Windows environments, here are PowerShell equivalents:

### Generate Schema
```powershell
$body = @{
    name = "John Doe"
    age = 30
    active = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:7071/api/generate-schema" -Method POST -Body $body -ContentType "application/json"
```

### Serialize with PowerShell
```powershell
$object = @{
    user = @{
        id = 123
        name = "Alice"
        preferences = @{
            theme = "dark"
            notifications = $true
        }
    }
}

$body = @{ object = $object } | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:7071/api/serialize" -Method POST -Body $body -ContentType "application/json"
```

These examples demonstrate the full capabilities of the JSON Tools API and how to integrate them into various workflows and applications.
