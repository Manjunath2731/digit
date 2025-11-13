@echo off
echo ========================================
echo Starting Digit Service
echo ========================================
echo.

cd /d "%~dp0"

echo Cleaning and building...
call mvn clean install -DskipTests

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo Build successful! Starting application...
echo.
echo Service will be available at: http://localhost:8080/digit-service
echo Health check: http://localhost:8080/digit-service/api/auth/health
echo.

call mvn spring-boot:run

pause
