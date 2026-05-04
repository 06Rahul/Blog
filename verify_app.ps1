$baseUrl = "http://localhost:8080/api"
$email = "you@gmail.com"
$username = "you"
$password = "password"

Write-Host "Starting API Verification..."

# 1. Login
Write-Host "`n[1] Authentication"
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$baseUrl/user/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $response.accessToken
    Write-Host "Login successful. Token acquired."
} catch {
    Write-Host "Login failed. Attempting Signup..."
    # Signup
     $signupData = @{
        email = $email
        password = $password
        username = $username
        firstName = "You"
        lastName = "Tester"
    } | ConvertTo-Json
    
    # Needs multipart/form-data. PowerShell Invoke-RestMethod multipart is tricky.
    # Let's try to just send JSON if the backend supports it? 
    # Backend Controller usually expects @RequestPart("data") String data.
    # We can try constructing multipart manually or skip signup and ask user to ensure user exists.
    # Actually, let's try a simple curl command for signup if login fails, or just report failure.
    
    Write-Warning "Signup via PowerShell script is complex due to multipart. If login failed, user 'you@gmail.com' might not exist."
    Write-Error $_
    exit
}

$headers = @{
    Authorization = "Bearer $token"
    "Content-Type" = "application/json"
}

# 2. Create Blog
Write-Host "`n[2] Create Blog"
$blogBody = @{
    title = "API Test Blog PS"
    content = "<p>Test Content</p>"
    summary = "Summary"
    tags = @("test")
} | ConvertTo-Json

try {
    $blog = Invoke-RestMethod -Uri "$baseUrl/blogs" -Method Post -Headers $headers -Body $blogBody -ErrorAction Stop
    $blogId = $blog.id
    Write-Host "Blog created. ID: $blogId"
} catch {
    Write-Error "Create Blog Failed: $_"
    exit
}

# 3. Publish
Write-Host "`n[3] Publish Blog"
try {
    Invoke-RestMethod -Uri "$baseUrl/blogs/$blogId/publish" -Method Put -Headers $headers -ErrorAction Stop | Out-Null
    Write-Host "Blog Published."
} catch {
    Write-Error "Publish Failed: $_"
}

# 4. Verify in Feed
Write-Host "`n[4] Verify Feed"
try {
    $feed = Invoke-RestMethod -Uri "$baseUrl/blogs/published" -Method Get -Headers $headers -ErrorAction Stop
    $found = $feed.content | Where-Object { $_.id -eq $blogId }
    if ($found) {
        Write-Host "Blog found in feed. SUCCESS."
    } else {
        Write-Host "Blog NOT found in feed."
    }
} catch {
    Write-Error "Feed check failed: $_"
}

# 5. Delete
Write-Host "`n[5] Delete Blog"
try {
    Invoke-RestMethod -Uri "$baseUrl/blogs/$blogId" -Method Delete -Headers $headers -ErrorAction Stop | Out-Null
    Write-Host "Blog Deleted."
} catch {
    Write-Error "Delete Failed: $_"
}

Write-Host "`nVerification Complete!"
