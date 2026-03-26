@echo off
echo ==================================
echo Pre-Deployment Checklist
echo ==================================
echo.

echo Checking environment files...
if exist "server\.env" (
    echo   [OK] server\.env exists
) else (
    echo   [ERROR] server\.env missing!
)

if exist "client\.env" (
    echo   [OK] client\.env exists
) else (
    echo   [WARNING] client\.env missing (optional)
)

echo.
echo Checking dependencies...
if exist "server\node_modules" (
    echo   [OK] Server dependencies installed
) else (
    echo   [ERROR] Server dependencies missing! Run: cd server ^&^& npm install
)

if exist "client\node_modules" (
    echo   [OK] Client dependencies installed
) else (
    echo   [ERROR] Client dependencies missing! Run: cd client ^&^& npm install
)

echo.
echo Checking Git status...
if exist ".git" (
    echo   [OK] Git repository initialized
    git remote -v | findstr "origin" >nul 2>&1
    if errorlevel 1 (
        echo   [WARNING] Git remote not configured
        echo     Run: git remote add origin ^<your-repo-url^>
    ) else (
        echo   [OK] Git remote configured
    )
) else (
    echo   [ERROR] Git not initialized!
    echo     Run: git init
)

echo.
echo ==================================
echo Manual Checks Required:
echo ==================================
echo [ ] Supabase schema applied (server/supabase/schema.sql)
echo [ ] Cloudinary account configured
echo [ ] GitHub repository created
echo [ ] Vercel account ready
echo [ ] Render/Railway account ready
echo.
echo ==================================
echo Next Steps:
echo ==================================
echo 1. Review DEPLOYMENT.md for detailed instructions
echo 2. Push code to GitHub
echo 3. Deploy backend to Render
echo 4. Deploy frontend to Vercel
echo 5. Update environment variables
echo.
pause
