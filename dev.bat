@echo off
REM VirtualDoc - Development Start Script (Single Port) for Windows
REM Runs everything on port 3003 for easy development

echo ========================================
echo   VirtualDoc - Development Mode
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install Node.js and try again.
    pause
    exit /b 1
)

echo ✅ Node.js is available

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm not found. Please install npm and try again.
    pause
    exit /b 1
)

echo ✅ npm is available

REM Navigate to frontend directory
cd frontend\web-app

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
)

echo ✅ Dependencies are ready

REM Start the development server
echo 🚀 Starting development server...
echo ========================================
echo   🎉 VirtualDoc is ready!
echo ========================================
echo.
echo 🌐 Access your application:
echo   • Web App: http://localhost:3003
echo.
echo 📝 Development Info:
echo   • Hot reload enabled
echo   • TypeScript support
echo   • Tailwind CSS included
echo   • React Router for navigation
echo.
echo 🎯 Features Available:
echo   • Landing page with three-tier pricing
echo   • Role-based navigation
echo   • Responsive design
echo   • Modern UI components
echo.
echo Happy coding! 🚀
echo.

REM Start Vite dev server
npm run dev
