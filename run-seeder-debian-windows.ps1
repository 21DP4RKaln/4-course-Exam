# Uzsākam datubāzes seedera palaišanu
Write-Host "Uzsākam datubāzes seedera palaišanu..." -ForegroundColor Cyan

# Pārbaudīt vai Docker konteineri jau ir palaisti
$containersRunning = docker-compose -f \\wsl.localhost\Ubuntu\home\svn\4-course-Exam\docker-compose.yml ps | Select-String -Pattern "Up" -Quiet
if (-not $containersRunning) {
    Write-Host "Palaižam Docker konteinerus..." -ForegroundColor Yellow
    docker-compose -f \\wsl.localhost\Ubuntu\home\svn\4-course-Exam\docker-compose.yml up -d
    Write-Host "Gaidām 15 sekundes, lai konteineri pilnībā palaistos..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
}

# Iegūstam tīkla nosaukumu
$networkName = docker network ls --filter name=4-course-exam --format "{{.Name}}" | Select-Object -First 1
Write-Host "Izmantojam tīklu: $networkName" -ForegroundColor Blue

# Būvējam un palaižam seedera konteineru
Write-Host "Palaižam datubāzes seederi..." -ForegroundColor Green
docker build -f \\wsl.localhost\Ubuntu\home\svn\4-course-Exam\Dockerfile.seeder -t ivapro-seeder \\wsl.localhost\Ubuntu\home\svn\4-course-Exam\
docker run --rm --network $networkName -e DATABASE_URL="mysql://root:password@db:3306/ivapro" ivapro-seeder npx tsx lib/seeder.ts

Write-Host "Datubāzes seederis izpildīts." -ForegroundColor Green
Write-Host "Nospiediet jebkuru taustiņu, lai izietu..."
$host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null
