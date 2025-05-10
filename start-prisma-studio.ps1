# This PowerShell script starts Prisma Studio for Windows users
Write-Host "Starting Prisma Studio..."
$wslPath = "\\wsl.localhost\Ubuntu\home\svn\4-course-Exam"
Set-Location $wslPath
& wsl -d Ubuntu -e bash -c "cd /home/svn/4-course-Exam && npx prisma studio"
