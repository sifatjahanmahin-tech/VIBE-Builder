# ============================================================
# VibeBuilder -- Blocks Data Gateway schema setup
# Run once: configure WebsiteProject + PageLayout schemas
# ============================================================

# ---- CONFIG -- fill these in --------------------------------
$EMAIL        = "bhondotrt@gmail.com"
$PASSWORD     = "Selisenotworking123@"
$BASE_URL     = "https://api.seliseblocks.com"
$BLOCKS_KEY   = "D9aab23f617c843d9a6806cc57af9f335"
$PROJECT_SLUG = "dlqxcb"
# ------------------------------------------------------------

$ErrorActionPreference = "Stop"

function Show-Step($msg) {
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "  $msg" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
}

function Invoke-BlocksApi($method, $path, $body, $token) {
    $headers = @{
        "Content-Type" = "application/json"
        "x-blocks-key" = $BLOCKS_KEY
    }
    if ($token) { $headers["Authorization"] = "Bearer $token" }

    $url = "$BASE_URL$path"
    Write-Host "  --> $method $url" -ForegroundColor Gray

    $params = @{
        Method  = $method
        Uri     = $url
        Headers = $headers
    }
    if ($body) {
        $params["Body"] = ($body | ConvertTo-Json -Depth 10 -Compress)
    }

    $response = Invoke-RestMethod @params
    Write-Host "  Response received." -ForegroundColor Gray
    $response | ConvertTo-Json -Depth 10 | Write-Host
    return $response
}

# ============================================================
# STEP 1 -- Login and get access token (three fallback attempts)
# ============================================================
Show-Step "Step 1: Login"

$TOKEN = $null

# Attempt 1: JSON with projectSlug (recommended Blocks format)
Write-Host "`n  [Attempt 1] JSON body with projectSlug" -ForegroundColor Yellow
try {
    $body1 = @{ email = $EMAIL; password = $PASSWORD; projectSlug = $PROJECT_SLUG }
    $loginRes = Invoke-BlocksApi "POST" "/idp/v1/authentication/login" $body1
    $TOKEN = $loginRes.access_token
    if ($TOKEN) { Write-Host "  Attempt 1 succeeded." -ForegroundColor Green }
} catch {
    Write-Host "  Attempt 1 failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Attempt 2: JSON without projectSlug
if (-not $TOKEN) {
    Write-Host "`n  [Attempt 2] JSON body without projectSlug" -ForegroundColor Yellow
    try {
        $body2 = @{ email = $EMAIL; password = $PASSWORD }
        $loginRes = Invoke-BlocksApi "POST" "/idp/v1/authentication/login" $body2
        $TOKEN = $loginRes.access_token
        if ($TOKEN) { Write-Host "  Attempt 2 succeeded." -ForegroundColor Green }
    } catch {
        Write-Host "  Attempt 2 failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Attempt 3: application/x-www-form-urlencoded
if (-not $TOKEN) {
    Write-Host "`n  [Attempt 3] form-urlencoded body" -ForegroundColor Yellow
    try {
        $url3      = "$BASE_URL/idp/v1/authentication/login"
        $headers3  = @{ "Content-Type" = "application/x-www-form-urlencoded"; "x-blocks-key" = $BLOCKS_KEY }
        $encEmail  = [uri]::EscapeDataString($EMAIL)
        $encPass   = [uri]::EscapeDataString($PASSWORD)
        $formBody  = "email=$encEmail" + "&password=$encPass" + "&projectSlug=$PROJECT_SLUG"
        Write-Host "  --> POST $url3" -ForegroundColor Gray
        $loginRes  = Invoke-RestMethod -Method POST -Uri $url3 -Headers $headers3 -Body $formBody
        Write-Host "  Response received." -ForegroundColor Gray
        $loginRes | ConvertTo-Json -Depth 10 | Write-Host
        $TOKEN = $loginRes.access_token
        if ($TOKEN) { Write-Host "  Attempt 3 succeeded." -ForegroundColor Green }
    } catch {
        Write-Host "  Attempt 3 failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

if (-not $TOKEN) {
    Write-Host "`nERROR: All login attempts failed. Check credentials and endpoint." -ForegroundColor Red
    exit 1
}
Write-Host "`n  Token acquired (first 40 chars): $($TOKEN.Substring(0, [Math]::Min(40,$TOKEN.Length)))..." -ForegroundColor Green

# ============================================================
# STEP 2 -- List existing schemas to find schema IDs
# ============================================================
Show-Step "Step 2: List existing schemas"

$schemasRes = Invoke-BlocksApi "GET" "/uds/v1/$PROJECT_SLUG/schemas" $null $TOKEN

$wpSchema = $schemasRes | Where-Object { $_.name -eq "WebsiteProject" } | Select-Object -First 1
$plSchema  = $schemasRes | Where-Object { $_.name -eq "PageLayout" }    | Select-Object -First 1

Write-Host "`n  WebsiteProject schema: $(if ($wpSchema) { $wpSchema.id } else { 'NOT FOUND' })" -ForegroundColor Yellow
Write-Host "  PageLayout schema:     $(if ($plSchema)  { $plSchema.id  } else { 'NOT FOUND - will create' })" -ForegroundColor Yellow

# ============================================================
# STEP 3 -- Create WebsiteProject schema if missing
# ============================================================
Show-Step "Step 3: Ensure WebsiteProject schema exists"

if (-not $wpSchema) {
    Write-Host "  Creating WebsiteProject schema..." -ForegroundColor Yellow
    $wpSchema = Invoke-BlocksApi "POST" "/uds/v1/$PROJECT_SLUG/schemas/define" @{
        name = "WebsiteProject"
        type = "Entity"
    } $TOKEN
    Write-Host "  WebsiteProject created with ID: $($wpSchema.id)" -ForegroundColor Green
} else {
    Write-Host "  WebsiteProject already exists (ID: $($wpSchema.id)), skipping create." -ForegroundColor Green
}

$WP_SCHEMA_ID = $wpSchema.id

# ============================================================
# STEP 4 -- Add fields to WebsiteProject
# ============================================================
Show-Step "Step 4: Add fields to WebsiteProject (id=$WP_SCHEMA_ID)"

$wpFields = @(
    @{ name = "siteId";   dataType = "String"; isRequired = $true;  isArray = $false },
    @{ name = "userId";   dataType = "String"; isRequired = $true;  isArray = $false },
    @{ name = "siteName"; dataType = "String"; isRequired = $true;  isArray = $false }
)

foreach ($field in $wpFields) {
    Write-Host "`n  Adding field '$($field.name)' to WebsiteProject..." -ForegroundColor Yellow
    $fieldBody = $field + @{ schemaId = $WP_SCHEMA_ID }
    try {
        Invoke-BlocksApi "POST" "/uds/v1/$PROJECT_SLUG/schemas/fields" $fieldBody $TOKEN
        Write-Host "  Field '$($field.name)' added." -ForegroundColor Green
    } catch {
        Write-Host "  WARNING: $($_.Exception.Message) (field may already exist)" -ForegroundColor Yellow
    }
}

# ============================================================
# STEP 5 -- Create PageLayout schema
# ============================================================
Show-Step "Step 5: Ensure PageLayout schema exists"

if (-not $plSchema) {
    Write-Host "  Creating PageLayout schema..." -ForegroundColor Yellow
    $plSchema = Invoke-BlocksApi "POST" "/uds/v1/$PROJECT_SLUG/schemas/define" @{
        name = "PageLayout"
        type = "Entity"
    } $TOKEN
    Write-Host "  PageLayout created with ID: $($plSchema.id)" -ForegroundColor Green
} else {
    Write-Host "  PageLayout already exists (ID: $($plSchema.id)), skipping create." -ForegroundColor Green
}

$PL_SCHEMA_ID = $plSchema.id

# ============================================================
# STEP 6 -- Add fields to PageLayout
# ============================================================
Show-Step "Step 6: Add fields to PageLayout (id=$PL_SCHEMA_ID)"

$plFields = @(
    @{ name = "pageId";      dataType = "String";  isRequired = $true;  isArray = $false },
    @{ name = "siteId";      dataType = "String";  isRequired = $true;  isArray = $false },
    @{ name = "userId";      dataType = "String";  isRequired = $true;  isArray = $false },
    @{ name = "pageName";    dataType = "String";  isRequired = $true;  isArray = $false },
    @{ name = "slug";        dataType = "String";  isRequired = $true;  isArray = $false },
    @{ name = "isPublished"; dataType = "Boolean"; isRequired = $false; isArray = $false },
    @{ name = "components";  dataType = "Object";  isRequired = $false; isArray = $false }
)

foreach ($field in $plFields) {
    Write-Host "`n  Adding field '$($field.name)' to PageLayout..." -ForegroundColor Yellow
    $fieldBody = $field + @{ schemaId = $PL_SCHEMA_ID }
    try {
        Invoke-BlocksApi "POST" "/uds/v1/$PROJECT_SLUG/schemas/fields" $fieldBody $TOKEN
        Write-Host "  Field '$($field.name)' added." -ForegroundColor Green
    } catch {
        Write-Host "  WARNING: $($_.Exception.Message) (field may already exist)" -ForegroundColor Yellow
    }
}

# ============================================================
# STEP 7 -- Reload configuration
# ============================================================
Show-Step "Step 7: Reload Data Gateway configuration"

$reloadRes = Invoke-BlocksApi "POST" "/uds/v1/$PROJECT_SLUG/configurations/reload" $null $TOKEN
Write-Host "  Reload response received." -ForegroundColor Green

# ============================================================
# DONE
# ============================================================
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  ALL DONE" -ForegroundColor Green
Write-Host "  WebsiteProject schema ID : $WP_SCHEMA_ID" -ForegroundColor Green
Write-Host "  PageLayout schema ID     : $PL_SCHEMA_ID" -ForegroundColor Green
Write-Host "  Verify in the Data Playground:" -ForegroundColor Green
Write-Host "  $BASE_URL/uds/v1/$PROJECT_SLUG/playground" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
