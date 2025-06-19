# PowerShell script to get the Azure Function master key for JSON Tools API
# Usage: .\Get-Master-Key.ps1 -ResourceGroup "json-tools" -FunctionAppName "json-tools"
# Or with defaults: .\Get-Master-Key.ps1

param(
    [Parameter(Mandatory = $false)]
    [string]$ResourceGroup = "jsontools",
    
    [Parameter(Mandatory = $false)]
    [string]$FunctionAppName = "json-tools"
)

Write-Host "🔧 Getting Azure Function master key for JSON Tools API..." -ForegroundColor Green
Write-Host "Resource Group: $ResourceGroup" -ForegroundColor Yellow
Write-Host "Function App: $FunctionAppName" -ForegroundColor Yellow
Write-Host ""

try {
    # Verify function app exists
    Write-Host "⏳ Verifying function app exists..." -ForegroundColor Cyan
    $functionApp = az functionapp show --resource-group $ResourceGroup --name $FunctionAppName --query "name" -o tsv
    if (-not $functionApp) {
        throw "Function app '$FunctionAppName' not found in resource group '$ResourceGroup'"
    }

    # Get master key for admin operations
    Write-Host "🔑 Getting master key..." -ForegroundColor Cyan
    $masterKey = az functionapp keys list --resource-group $ResourceGroup --name $FunctionAppName --query "masterKey" -o tsv
    
    if (-not $masterKey) {
        throw "Could not retrieve master key for function app"
    }

    Write-Host ""
    Write-Host "🎉 Configuration complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "=== NINTEX CONNECTION SETTINGS ===" -ForegroundColor Yellow
    Write-Host "Base URL: https://$FunctionAppName.azurewebsites.net" -ForegroundColor White
    Write-Host "Auth Type: API Key" -ForegroundColor White
    Write-Host "Header Name: Api-Key" -ForegroundColor White
    Write-Host "Key Value: $masterKey" -ForegroundColor White
    Write-Host ""
    Write-Host "=== SWAGGER UI (Anonymous) ===" -ForegroundColor Yellow
    Write-Host "Swagger UI: https://$FunctionAppName.azurewebsites.net/api/swagger" -ForegroundColor White
    Write-Host "Swagger JSON: https://$FunctionAppName.azurewebsites.net/api/swagger.json" -ForegroundColor White
    Write-Host ""
    Write-Host "=== TEST COMMANDS ===" -ForegroundColor Yellow
    Write-Host "# Test Swagger UI (no auth required):" -ForegroundColor Gray
    Write-Host "Invoke-RestMethod -Uri 'https://$FunctionAppName.azurewebsites.net/api/swagger'" -ForegroundColor White
    Write-Host ""
    Write-Host "# Test JSON API endpoint (requires master key):" -ForegroundColor Gray
    Write-Host "Invoke-RestMethod -Uri 'https://$FunctionAppName.azurewebsites.net/api/serialize' -Method POST -Headers @{'Api-Key'='$masterKey'} -Body '{\"data\":{\"test\":\"value\"}}' -ContentType 'application/json'" -ForegroundColor White
    Write-Host ""
    Write-Host "💾 Save the master key securely - you'll need it for your Nintex Connection!" -ForegroundColor Magenta

}
catch {
    Write-Host ""
    Write-Host "❌ Configuration failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}
