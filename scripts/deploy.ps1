# Complete deployment automation script for Stripe integration
# Run this script to deploy your application with all necessary checks

param(
    [switch]$Production,
    [switch]$SkipTests,
    [string]$Domain
)

Write-Host "🚀 Starting automated deployment process..." -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

# Step 1: Pre-deployment checks
Write-Host "`n📋 Step 1: Pre-deployment checks" -ForegroundColor Yellow

if (-not $SkipTests) {
    Write-Host "🔍 Running build test..." -ForegroundColor Cyan
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed. Fix errors before deploying." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Build successful" -ForegroundColor Green
}

Write-Host "🔧 Checking Stripe configuration..." -ForegroundColor Cyan
npm run debug:stripe
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Stripe configuration issues detected" -ForegroundColor Yellow
}

Write-Host "🕸️  Validating webhook setup..." -ForegroundColor Cyan
npm run validate:webhook

# Step 2: Environment setup
Write-Host "`n🌍 Step 2: Environment setup" -ForegroundColor Yellow

if ($Domain) {
    Write-Host "🔗 Setting up domain: $Domain" -ForegroundColor Cyan
    # Set the base URL environment variable
    $env:NEXT_PUBLIC_BASE_URL = "https://$Domain"
}

# Check if .env file exists
if (Test-Path ".env") {
    Write-Host "📄 Found .env file, setting up Vercel environment variables..." -ForegroundColor Cyan
    .\scripts\setup-vercel-env.ps1
} else {
    Write-Host "⚠️  No .env file found. Make sure environment variables are set in Vercel." -ForegroundColor Yellow
}

# Step 3: Database cleanup
Write-Host "`n🗄️  Step 3: Database maintenance" -ForegroundColor Yellow

Write-Host "🧹 Checking for stuck orders..." -ForegroundColor Cyan
npm run fix:pending

Write-Host "🗑️  Cleaning up old incomplete orders..." -ForegroundColor Cyan
npm run cleanup:orders

# Step 4: Deployment
Write-Host "`n🚀 Step 4: Deployment" -ForegroundColor Yellow

if ($Production) {
    Write-Host "🌐 Deploying to PRODUCTION..." -ForegroundColor Red
    Write-Host "⚠️  This will deploy to your live domain!" -ForegroundColor Yellow
    
    $confirm = Read-Host "Are you sure you want to deploy to production? (y/N)"
    if ($confirm -ne "y" -and $confirm -ne "Y") {
        Write-Host "❌ Deployment cancelled" -ForegroundColor Red
        exit 0
    }
    
    vercel --prod
} else {
    Write-Host "🔍 Deploying to PREVIEW..." -ForegroundColor Cyan
    vercel
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deployment failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Deployment successful!" -ForegroundColor Green

# Step 5: Post-deployment setup
Write-Host "`n⚙️  Step 5: Post-deployment setup" -ForegroundColor Yellow

$deploymentUrl = vercel ls --json | ConvertFrom-Json | Select-Object -First 1 | Select-Object -ExpandProperty url

if ($deploymentUrl) {
    $fullUrl = "https://$deploymentUrl"
    Write-Host "🔗 Deployment URL: $fullUrl" -ForegroundColor Cyan
    
    Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
    Write-Host "1. 🕸️  Configure Stripe webhook:" -ForegroundColor White
    Write-Host "   URL: $fullUrl/api/webhook/stripe" -ForegroundColor Gray
    Write-Host "   Events: checkout.session.completed, payment_intent.succeeded" -ForegroundColor Gray
    
    Write-Host "2. 🧪 Test the payment flow:" -ForegroundColor White
    Write-Host "   - Make a test purchase" -ForegroundColor Gray
    Write-Host "   - Check order status updates" -ForegroundColor Gray
    Write-Host "   - Verify webhook delivery in Stripe dashboard" -ForegroundColor Gray
    
    Write-Host "3. 📊 Monitor logs:" -ForegroundColor White
    Write-Host "   vercel logs --follow" -ForegroundColor Gray
}

# Step 6: Verification
Write-Host "`n✅ Step 6: Deployment verification" -ForegroundColor Yellow

Write-Host "🔍 Running post-deployment checks..." -ForegroundColor Cyan

# Test API endpoints
if ($deploymentUrl) {
    $healthCheckUrl = "$fullUrl/api/orders"
    try {
        $response = Invoke-WebRequest -Uri $healthCheckUrl -Method HEAD -ErrorAction Stop
        Write-Host "✅ API endpoints accessible" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  API endpoint check failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n🎉 Deployment process completed!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan

Write-Host "`n📚 Resources:" -ForegroundColor Yellow
Write-Host "- Troubleshooting: docs/STRIPE_TROUBLESHOOTING.md" -ForegroundColor Gray
Write-Host "- Deployment guide: docs/DEPLOYMENT_CHECKLIST.md" -ForegroundColor Gray
Write-Host "- Stripe dashboard: https://dashboard.stripe.com" -ForegroundColor Gray
Write-Host "- Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Gray

if ($Production) {
    Write-Host "`n🚨 Production deployment complete!" -ForegroundColor Red
    Write-Host "Monitor the application closely for the next hour." -ForegroundColor Yellow
} else {
    Write-Host "`n🔍 Preview deployment complete!" -ForegroundColor Cyan
    Write-Host "Test thoroughly before deploying to production." -ForegroundColor Yellow
}
