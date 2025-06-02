# PowerShell script to setup Vercel environment variables
# Run this script after setting up your local .env file

Write-Host "🚀 Setting up Vercel environment variables..." -ForegroundColor Green

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found. Create one first with your environment variables." -ForegroundColor Red
    exit 1
}

# Load .env file
Get-Content .env | ForEach-Object {
    if ($_ -match "^([^#][^=]*)=(.*)$") {
        $name = $matches[1]
        $value = $matches[2]
        # Remove quotes if present
        $value = $value -replace '^"(.*)"$', '$1'
        [Environment]::SetEnvironmentVariable($name, $value, "Process")
    }
}

# Check if Vercel CLI is installed
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI found" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI not found. Install with: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# Required environment variables
$requiredVars = @(
    "NEXT_PUBLIC_BASE_URL",
    "STRIPE_PUBLIC_KEY", 
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "DATABASE_URL",
    "NEXTAUTH_SECRET"
)

Write-Host "`n📋 Setting up environment variables in Vercel..." -ForegroundColor Yellow

foreach ($var in $requiredVars) {
    $value = [Environment]::GetEnvironmentVariable($var, "Process")
    
    if ($value) {
        Write-Host "🔧 Setting $var..." -ForegroundColor Cyan
        
        # Set for production
        try {
            vercel env add $var production --force 2>$null
            Write-Host $value
            Write-Host "✅ $var set for production" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Failed to set $var for production" -ForegroundColor Yellow
        }
        
        # Set for preview
        try {
            vercel env add $var preview --force 2>$null  
            Write-Host $value
            Write-Host "✅ $var set for preview" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Failed to set $var for preview" -ForegroundColor Yellow
        }
        
        # Set for development
        try {
            vercel env add $var development --force 2>$null
            Write-Host $value  
            Write-Host "✅ $var set for development" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Failed to set $var for development" -ForegroundColor Yellow
        }
        
        Write-Host ""
    } else {
        Write-Host "❌ $var not found in .env file" -ForegroundColor Red
    }
}

Write-Host "🎉 Environment variable setup complete!" -ForegroundColor Green
Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Configure Stripe webhook: https://dashboard.stripe.com/webhooks"
Write-Host "2. Set webhook URL to: https://your-domain.vercel.app/api/webhook/stripe"
Write-Host "3. Enable events: checkout.session.completed, payment_intent.succeeded"
Write-Host "4. Deploy with: vercel --prod"

Write-Host "`n🔍 Verify setup with:" -ForegroundColor Cyan
Write-Host "vercel env ls"
