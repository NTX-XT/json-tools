# Testing Guide

This document provides comprehensive testing strategies and examples for the JSON Tools API, including manual testing, automated testing approaches, and validation procedures.

## Table of Contents

- [Local Testing Setup](#local-testing-setup)
- [Manual Testing](#manual-testing)
- [Automated Testing](#automated-testing)
- [Performance Testing](#performance-testing)
- [Security Testing](#security-testing)
- [Nintex Integration Testing](#nintex-integration-testing)
- [Troubleshooting](#troubleshooting)

## Local Testing Setup

### Prerequisites
- Azure Functions Core Tools
- Node.js 18+
- curl or PowerShell (for command-line testing)
- Postman or similar API testing tool (optional)

### Start the Development Server
```bash
npm install
npm start
```

The API will be available at `http://localhost:7071/api`

### Verify Server is Running
```bash
curl http://localhost:7071/api/swagger.json
```

## Manual Testing

### Quick Health Check
Test each endpoint with a simple request to ensure they're all responding:

```bash
# Generate Schema
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"test": "value"}'

# Serialize
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{"object": {"test": "value"}}'

# Deserialize
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{"value": "{\"test\":\"value\"}", "sample": "{\"test\":\"string\"}"}'

# Merge
curl -X POST "http://localhost:7071/api/merge" \
  -H "Content-Type: application/json" \
  -d '{"template": "Hello {{name}}", "data": "{\"name\":\"World\"}"}'

# Join
curl -X POST "http://localhost:7071/api/join" \
  -H "Content-Type: application/json" \
  -d '{"first": "{\"a\":1}", "second": "{\"b\":2}"}'

# Add Property
curl -X POST "http://localhost:7071/api/add-property" \
  -H "Content-Type: application/json" \
  -d '{"json": "{\"test\":\"value\"}", "key": "new", "value": "property"}'

# To XML
curl -X POST "http://localhost:7071/api/to-xml" \
  -H "Content-Type: application/json" \
  -d '{"serializedJson": "{\"test\":\"value\"}", "encode": false}'
```

### Comprehensive Test Suite

#### 1. Generate Schema Tests

**Test 1: Simple Object**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 30, "active": true}'
```
*Expected: Schema with string types for all properties*

**Test 2: Nested Objects**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"user": {"profile": {"name": "John", "settings": {"theme": "dark"}}}}'
```
*Expected: Nested object schema with proper structure*

**Test 3: Arrays**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '[{"id": 1, "name": "Item1"}, {"id": 2, "name": "Item2"}]'
```
*Expected: Array schema with object items*

**Test 4: Sample Property (String)**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"sample": "{\"name\": \"John\", \"age\": 30}"}'
```
*Expected: Schema generated from parsed sample string*

**Test 5: Sample Property (Object)**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"sample": {"name": "John", "age": 30}}'
```
*Expected: Schema generated from sample object*

**Test 6: Empty Object**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{}'
```
*Expected: Object schema with no properties*

**Test 7: Null Values**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "middleName": null, "age": 30}'
```
*Expected: Schema with null type for middleName*

#### 2. Error Handling Tests

**Test Invalid JSON**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"invalid": json}'
```
*Expected: 400 error with JSON parse error message*

**Test Empty Body**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d ''
```
*Expected: 400 error about missing request body*

**Test Invalid Content-Type**
```bash
curl -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: text/plain" \
  -d '{"test": "value"}'
```
*Expected: Should still work (Azure Functions is flexible)*

#### 3. Serialize Tests

**Test Complex Object**
```bash
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{"object": {"user": {"id": 123, "profile": {"name": "John", "preferences": {"theme": "dark", "notifications": true}}}}}'
```
*Expected: Properly escaped JSON string*

**Test Array**
```bash
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{"object": [{"id": 1, "name": "Item1"}, {"id": 2, "name": "Item2"}]}'
```
*Expected: JSON array string*

**Test Missing Object Parameter**
```bash
curl -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{}'
```
*Expected: 400 error about missing object parameter*

#### 4. Deserialize Tests

**Test Basic Deserialization**
```bash
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{"value": "{\"name\":\"John\",\"age\":30}", "sample": "{\"name\":\"string\",\"age\":0}"}'
```
*Expected: Parsed object with proper types*

**Test Invalid JSON in Value**
```bash
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{"value": "{invalid json}", "sample": "{\"test\":\"string\"}"}'
```
*Expected: 400 error about invalid JSON*

**Test Missing Parameters**
```bash
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{"value": "{\"test\":\"value\"}"}'
```
*Expected: Should work (sample is optional)*

#### 5. Integration Tests

**Test Serialize -> Deserialize Round Trip**
```bash
# Step 1: Serialize
SERIALIZED=$(curl -s -X POST "http://localhost:7071/api/serialize" \
  -H "Content-Type: application/json" \
  -d '{"object": {"name": "John", "age": 30, "active": true}}')

echo "Serialized: $SERIALIZED"

# Step 2: Deserialize
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d "{\"value\": $SERIALIZED, \"sample\": \"{\\\"name\\\":\\\"string\\\",\\\"age\\\":0,\\\"active\\\":false}\"}"
```
*Expected: Original object should be recovered*

**Test Generate Schema -> Use for Deserialization**
```bash
# Step 1: Generate schema
SCHEMA=$(curl -s -X POST "http://localhost:7071/api/generate-schema" \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "age": 30}')

echo "Schema: $SCHEMA"

# Step 2: Use schema structure for deserialization sample
curl -X POST "http://localhost:7071/api/deserialize" \
  -H "Content-Type: application/json" \
  -d '{"value": "{\"name\":\"Jane\",\"age\":25}", "sample": "{\"name\":\"string\",\"age\":0}"}'
```

## Automated Testing

### PowerShell Test Script

Create a comprehensive test script `test-api.ps1`:

```powershell
# JSON Tools API Test Suite
param(
    [string]$BaseUrl = "http://localhost:7071/api"
)

Write-Host "Testing JSON Tools API at $BaseUrl" -ForegroundColor Green

$tests = @()
$passed = 0
$failed = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Endpoint,
        [string]$Method = "POST",
        [hashtable]$Body,
        [string]$ExpectedStatus = "200"
    )
    
    try {
        $jsonBody = $Body | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$BaseUrl/$Endpoint" -Method $Method -Body $jsonBody -ContentType "application/json" -ErrorAction Stop
        
        Write-Host "✓ $Name" -ForegroundColor Green
        $script:passed++
        return $response
    }
    catch {
        Write-Host "✗ $Name - $($_.Exception.Message)" -ForegroundColor Red
        $script:failed++
        return $null
    }
}

# Test Generate Schema
Test-Endpoint "Generate Schema - Simple Object" "generate-schema" -Body @{
    name = "John"
    age = 30
    active = $true
}

Test-Endpoint "Generate Schema - Sample String" "generate-schema" -Body @{
    sample = '{"name": "John", "age": 30}'
}

Test-Endpoint "Generate Schema - Array" "generate-schema" -Body @(
    @{id = 1; name = "Item1"},
    @{id = 2; name = "Item2"}
)

# Test Serialize
Test-Endpoint "Serialize - Object" "serialize" -Body @{
    object = @{
        user = @{
            id = 123
            name = "Alice"
        }
    }
}

# Test Deserialize
Test-Endpoint "Deserialize - JSON String" "deserialize" -Body @{
    value = '{"name":"Bob","age":25}'
    sample = '{"name":"string","age":0}'
}

# Test Merge
Test-Endpoint "Merge - Template" "merge" -Body @{
    template = "Hello {{name}}, you are {{age}} years old!"
    data = '{"name":"Sarah","age":28}'
}

# Test Join
Test-Endpoint "Join - Objects" "join" -Body @{
    first = '{"name":"John","age":30}'
    second = '{"city":"New York","country":"USA"}'
}

# Test Add Property
Test-Endpoint "Add Property" "add-property" -Body @{
    json = '{"name":"John"}'
    key = "email"
    value = "john@example.com"
}

# Test XML Conversion
Test-Endpoint "To XML" "to-xml" -Body @{
    serializedJson = '{"user":{"name":"John","age":30}}'
    encode = $false
}

# Results
Write-Host "`nTest Results:" -ForegroundColor Yellow
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red

if ($failed -eq 0) {
    Write-Host "All tests passed! ✓" -ForegroundColor Green
    exit 0
} else {
    Write-Host "Some tests failed! ✗" -ForegroundColor Red
    exit 1
}
```

Run with:
```powershell
.\test-api.ps1
```

### Bash Test Script

Create `test-api.sh`:

```bash
#!/bin/bash

BASE_URL="http://localhost:7071/api"
PASSED=0
FAILED=0

test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local data="$3"
    
    echo -n "Testing $name... "
    
    response=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/$endpoint" \
        -H "Content-Type: application/json" \
        -d "$data")
    
    http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        echo "✓ PASSED"
        ((PASSED++))
    else
        echo "✗ FAILED (HTTP $http_code)"
        ((FAILED++))
    fi
}

echo "Testing JSON Tools API at $BASE_URL"
echo "======================================="

# Test cases
test_endpoint "Generate Schema" "generate-schema" '{"name": "John", "age": 30}'
test_endpoint "Serialize" "serialize" '{"object": {"name": "John"}}'
test_endpoint "Deserialize" "deserialize" '{"value": "{\"name\":\"John\"}", "sample": "{\"name\":\"string\"}"}'
test_endpoint "Merge" "merge" '{"template": "Hello {{name}}", "data": "{\"name\":\"World\"}"}'
test_endpoint "Join" "join" '{"first": "{\"a\":1}", "second": "{\"b\":2}"}'
test_endpoint "Add Property" "add-property" '{"json": "{\"test\":\"value\"}", "key": "new", "value": "property"}'
test_endpoint "To XML" "to-xml" '{"serializedJson": "{\"test\":\"value\"}", "encode": false}'

echo "======================================="
echo "Results: $PASSED passed, $FAILED failed"

if [ $FAILED -eq 0 ]; then
    echo "All tests passed! ✓"
    exit 0
else
    echo "Some tests failed! ✗"
    exit 1
fi
```

Run with:
```bash
chmod +x test-api.sh
./test-api.sh
```

## Performance Testing

### Load Testing with curl

Test endpoint performance with multiple concurrent requests:

```bash
# Test 10 concurrent requests
for i in {1..10}; do
    curl -X POST "http://localhost:7071/api/generate-schema" \
        -H "Content-Type: application/json" \
        -d '{"name": "John", "age": 30, "test": "'$i'"}' &
done
wait

echo "All requests completed"
```

### Memory Usage Testing

Test with large JSON objects:

```bash
# Generate large object
LARGE_OBJECT='{"users": ['
for i in {1..1000}; do
    LARGE_OBJECT+="{\"id\": $i, \"name\": \"User$i\", \"email\": \"user$i@example.com\"}"
    if [ $i -lt 1000 ]; then
        LARGE_OBJECT+=","
    fi
done
LARGE_OBJECT+=']}'

# Test schema generation with large object
curl -X POST "http://localhost:7071/api/generate-schema" \
    -H "Content-Type: application/json" \
    -d "$LARGE_OBJECT"
```

## Security Testing

### Authentication Testing

```bash
# Test without authentication (should work locally)
curl -X POST "http://localhost:7071/api/generate-schema" \
    -H "Content-Type: application/json" \
    -d '{"test": "value"}'

# Test with invalid key (against deployed API)
curl -X POST "https://your-app.azurewebsites.net/api/generate-schema" \
    -H "Content-Type: application/json" \
    -H "x-functions-key: invalid-key" \
    -d '{"test": "value"}'
```

### Input Validation Testing

```bash
# Test extremely large input
curl -X POST "http://localhost:7071/api/generate-schema" \
    -H "Content-Type: application/json" \
    -d '{"data": "'$(python -c 'print("x" * 1000000)')'"}'

# Test special characters
curl -X POST "http://localhost:7071/api/generate-schema" \
    -H "Content-Type: application/json" \
    -d '{"special": "<!DOCTYPE html><script>alert(\"test\")</script>"}'

# Test unicode
curl -X POST "http://localhost:7071/api/generate-schema" \
    -H "Content-Type: application/json" \
    -d '{"unicode": "Hello 世界 🌍 émojis"}'
```

## Nintex Integration Testing

### Test Dynamic Schema Generation

```bash
# Test schema generation for Nintex forms
curl -X POST "http://localhost:7071/api/generate-schema" \
    -H "Content-Type: application/json" \
    -d '{"sample": "{\"applicantName\": \"string\", \"applicationDate\": \"2025-06-19\", \"requestedAmount\": 50000, \"projectDescription\": \"string\", \"agreeTsAndCs\": true}"}'
```

### Test Workflow Data Processing

```bash
# Simulate workflow data transformation
# Step 1: Deserialize form data
FORM_DATA=$(curl -s -X POST "http://localhost:7071/api/deserialize" \
    -H "Content-Type: application/json" \
    -d '{"value": "{\"name\":\"John Smith\",\"email\":\"john@company.com\",\"department\":\"IT\"}", "sample": "{\"name\":\"string\",\"email\":\"string\",\"department\":\"string\"}"}')

echo "Deserialized: $FORM_DATA"

# Step 2: Add approval data
ENHANCED_DATA=$(curl -s -X POST "http://localhost:7071/api/add-property" \
    -H "Content-Type: application/json" \
    -d '{"json": "'"$FORM_DATA"'", "key": "approvalStatus", "value": "pending"}')

echo "Enhanced: $ENHANCED_DATA"

# Step 3: Convert to XML for legacy system
XML_OUTPUT=$(curl -s -X POST "http://localhost:7071/api/to-xml" \
    -H "Content-Type: application/json" \
    -d '{"serializedJson": "'"$ENHANCED_DATA"'", "encode": true}')

echo "XML: $XML_OUTPUT"
```

## Troubleshooting

### Common Issues

**Issue: "Connection refused"**
- Ensure Azure Functions host is running (`npm start`)
- Check port 7071 is not in use by another process

**Issue: "Invalid JSON" errors**
- Validate JSON syntax using online validators
- Check for proper escaping in curl commands
- Use PowerShell `ConvertTo-Json` for complex objects

**Issue: Functions not starting**
- Check Node.js version (18+ required)
- Verify Azure Functions Core Tools installation
- Check `host.json` and `local.settings.json` files

**Issue: TypeScript compilation errors**
- Run `npm run build` to check for compilation issues
- Ensure all dependencies are installed (`npm install`)

### Debug Mode

Enable detailed logging:

```json
// local.settings.json
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

### Monitoring

Monitor function execution:

```bash
# Watch function logs in real-time
func logs --verbose
```

## Test Data Sets

### Sample Test Data

Create `test-data.json`:

```json
{
  "simpleObject": {
    "name": "John Doe",
    "age": 30,
    "active": true
  },
  "complexObject": {
    "user": {
      "id": 123,
      "profile": {
        "name": "Alice Johnson",
        "email": "alice@company.com",
        "preferences": {
          "theme": "dark",
          "notifications": true
        }
      },
      "roles": ["admin", "user"],
      "lastLogin": "2025-06-19T10:30:00Z"
    }
  },
  "arrayData": [
    {"id": 1, "name": "Product A", "price": 29.99},
    {"id": 2, "name": "Product B", "price": 39.99}
  ],
  "grantApplication": {
    "applicantName": "Dr. Sarah Wilson",
    "typeOfGrant": "Research Grant",
    "applicationDate": "2025-06-19",
    "requestedAmount": 75000,
    "projectDescription": "AI-driven climate modeling research",
    "startDate": "2025-09-01",
    "endDate": "2026-08-31",
    "agreeTsAndCs": true,
    "applicationStatus": "submitted",
    "externalID": "RG-2025-042"
  }
}
```

This comprehensive testing guide ensures the JSON Tools API works correctly across all scenarios and integrates properly with Nintex workflows.
