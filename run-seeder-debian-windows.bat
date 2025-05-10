@echo off
echo Uzsākam datubāzes seedera palaišanu...

REM Pārbaudīt vai Docker konteineri jau ir palaisti
docker-compose -f \\wsl.localhost\Ubuntu\home\svn\4-course-Exam\docker-compose.yml ps | findstr "Up" > nul
if errorlevel 1 (
    echo Palaižam Docker konteinerus...
    docker-compose -f \\wsl.localhost\Ubuntu\home\svn\4-course-Exam\docker-compose.yml up -d
    echo Gaidām 15 sekundes, lai konteineri pilnībā palaistos...
    timeout /t 15 /nobreak > nul
)

REM Iegūstam tīkla nosaukumu
FOR /F "tokens=*" %%G IN ('docker network ls --filter name^=4-course-exam --format "{{.Name}}"') DO SET networkName=%%G
echo Izmantojam tiklu: %networkName%

REM Būvējam un palaižam seedera konteineru
echo Palaižam datubāzes seederi...
docker build -f \\wsl.localhost\Ubuntu\home\svn\4-course-Exam\Dockerfile.seeder -t ivapro-seeder \\wsl.localhost\Ubuntu\home\svn\4-course-Exam\
docker run --rm --network %networkName% -e DATABASE_URL="mysql://root:password@db:3306/ivapro" ivapro-seeder npx tsx lib/seeder.ts

echo Datubāzes seederis izpildīts.
pause
