@echo off
setlocal enabledelayedexpansion

REM VirtualDoc - Simple MVP Setup Script (Windows)
REM One command to rule them all!

echo ========================================
echo   VirtualDoc - Simple MVP Setup
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker not found. Please install Docker Desktop first.
    echo Download from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker Desktop.
    pause
    exit /b 1
)

echo [OK] Docker is running

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] Node.js not found. Will use Docker for everything.
    set NODE_INSTALLED=false
) else (
    echo [OK] Node.js is available
    set NODE_INSTALLED=true
)

REM Create simple project structure
echo [INFO] Creating simple project structure...

REM Create directories if they don't exist
if not exist "frontend\src\components" mkdir "frontend\src\components"
if not exist "frontend\src\pages" mkdir "frontend\src\pages"
if not exist "frontend\src\hooks" mkdir "frontend\src\hooks"
if not exist "frontend\src\utils" mkdir "frontend\src\utils"
if not exist "frontend\public" mkdir "frontend\public"
if not exist "backend\src\controllers" mkdir "backend\src\controllers"
if not exist "backend\src\routes" mkdir "backend\src\routes"
if not exist "backend\src\models" mkdir "backend\src\models"
if not exist "backend\src\middleware" mkdir "backend\src\middleware"
if not exist "database" mkdir "database"

echo [OK] Project structure created

REM Create simple package.json for frontend
(
echo {
echo   "name": "virtualdoc-frontend",
echo   "private": true,
echo   "version": "0.0.0",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "vite",
echo     "build": "tsc && vite build",
echo     "preview": "vite preview"
echo   },
echo   "dependencies": {
echo     "react": "^18.2.0",
echo     "react-dom": "^18.2.0",
echo     "react-router-dom": "^6.8.1",
echo     "axios": "^1.3.4"
echo   },
echo   "devDependencies": {
echo     "@types/react": "^18.0.28",
echo     "@types/react-dom": "^18.0.11",
echo     "@vitejs/plugin-react": "^3.1.0",
echo     "autoprefixer": "^10.4.14",
echo     "postcss": "^8.4.21",
echo     "tailwindcss": "^3.2.7",
echo     "typescript": "^4.9.3",
echo     "vite": "^4.1.0"
echo   }
echo }
) > "frontend\package.json"

REM Create simple package.json for backend
(
echo {
echo   "name": "virtualdoc-backend",
echo   "version": "1.0.0",
echo   "description": "VirtualDoc API",
echo   "main": "src/index.js",
echo   "type": "module",
echo   "scripts": {
echo     "dev": "nodemon src/index.js",
echo     "start": "node src/index.js"
echo   },
echo   "dependencies": {
echo     "express": "^4.18.2",
echo     "cors": "^2.8.5",
echo     "dotenv": "^16.0.3",
echo     "pg": "^8.9.0"
echo   },
echo   "devDependencies": {
echo     "nodemon": "^2.0.20"
echo   }
echo }
) > "backend\package.json"

REM Create simple Dockerfiles
(
echo FROM node:18-alpine
echo.
echo WORKDIR /app
echo.
echo COPY package*.json ./
echo RUN npm install
echo.
echo COPY . .
echo.
echo EXPOSE 3000
echo.
echo CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
) > "frontend\Dockerfile"

(
echo FROM node:18-alpine
echo.
echo WORKDIR /app
echo.
echo COPY package*.json ./
echo RUN npm install
echo.
echo COPY . .
echo.
echo EXPOSE 3001
echo.
echo CMD ["npm", "run", "dev"]
) > "backend\Dockerfile"

REM Create simple database schema
(
echo -- VirtualDoc Simple Database Schema
echo.
echo CREATE TABLE users ^(
echo     id SERIAL PRIMARY KEY,
echo     email VARCHAR^(255^) UNIQUE NOT NULL,
echo     password_hash VARCHAR^(255^) NOT NULL,
echo     first_name VARCHAR^(100^) NOT NULL,
echo     last_name VARCHAR^(100^) NOT NULL,
echo     role VARCHAR^(50^) DEFAULT 'patient',
echo     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
echo     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE TABLE patients ^(
echo     id SERIAL PRIMARY KEY,
echo     user_id INTEGER REFERENCES users^(id^),
echo     date_of_birth DATE,
echo     phone VARCHAR^(20^),
echo     address TEXT,
echo     medical_history TEXT,
echo     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE TABLE doctors ^(
echo     id SERIAL PRIMARY KEY,
echo     user_id INTEGER REFERENCES users^(id^),
echo     license_number VARCHAR^(100^) UNIQUE NOT NULL,
echo     specialization VARCHAR^(100^),
echo     experience_years INTEGER,
echo     consultation_fee DECIMAL^(10,2^),
echo     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
echo.
echo CREATE TABLE appointments ^(
echo     id SERIAL PRIMARY KEY,
echo     patient_id INTEGER REFERENCES patients^(id^),
echo     doctor_id INTEGER REFERENCES doctors^(id^),
echo     appointment_date TIMESTAMP NOT NULL,
echo     status VARCHAR^(50^) DEFAULT 'scheduled',
echo     notes TEXT,
echo     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
echo ^);
) > "database\schema.sql"

REM Create frontend files
(
echo import React from 'react';
echo import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
echo import Landing from './pages/Landing';
echo import Login from './pages/Login';
echo import Register from './pages/Register';
echo import Dashboard from './pages/Dashboard';
echo import './App.css';
echo.
echo function App^(^) {
echo   return ^(
echo     <Router>
echo       <div className="App">
echo         <Routes>
echo           <Route path="/" element={<Landing />} />
echo           <Route path="/login" element={<Login />} />
echo           <Route path="/register" element={<Register />} />
echo           <Route path="/dashboard" element={<Dashboard />} />
echo         </Routes>
echo       </div>
echo     </Router>
echo   ^);
echo }
echo.
echo export default App;
) > "frontend\src\App.tsx"

(
echo import React from 'react'
echo import ReactDOM from 'react-dom/client'
echo import App from './App.tsx'
echo import './index.css'
echo.
echo ReactDOM.createRoot^(document.getElementById^('root'^)^!^).render^(
echo   <React.StrictMode>
echo     <App />
echo   </React.StrictMode>,
echo ^)
) > "frontend\src\main.tsx"

(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
) > "frontend\src\index.css"

(
echo @tailwind base;
echo @tailwind components;
echo @tailwind utilities;
echo.
echo .App {
echo   text-align: center;
echo }
) > "frontend\src\App.css"

(
echo import { defineConfig } from 'vite'
echo import react from '@vitejs/plugin-react'
echo.
echo export default defineConfig^(^{
echo   plugins: [react^(^)],
echo   server: {
echo     host: '0.0.0.0',
echo     port: 3000
echo   }
echo }^)
) > "frontend\vite.config.ts"

(
echo /** @type {import^('tailwindcss'^).Config} */
echo export default {
echo   content: [
echo     "./index.html",
echo     "./src/**/*.{js,ts,jsx,tsx}",
echo   ],
echo   theme: {
echo     extend: {},
echo   },
echo   plugins: [],
echo }
) > "frontend\tailwind.config.js"

(
echo <!doctype html>
echo <html lang="en">
echo   <head>
echo     <meta charset="UTF-8" />
echo     <link rel="icon" type="image/svg+xml" href="/vite.svg" />
echo     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
echo     <title>VirtualDoc - Virtual Healthcare Made Simple</title>
echo   </head>
echo   <body>
echo     <div id="root"></div>
echo     <script type="module" src="/src/main.tsx"></script>
echo   </body>
echo </html>
) > "frontend\index.html"

REM Create backend files
(
echo import express from 'express';
echo import cors from 'cors';
echo import dotenv from 'dotenv';
echo.
echo dotenv.config^(^);
echo.
echo const app = express^(^);
echo const PORT = process.env.PORT ^|^| 3001;
echo.
echo // Middleware
echo app.use^(cors^(^)^);
echo app.use^(express.json^(^)^);
echo.
echo // Routes
echo app.get^('/', ^(req, res^) =^> {
echo   res.json^({ 
echo     message: 'VirtualDoc API is running!',
echo     version: '1.0.0',
echo     status: 'healthy'
echo   }^);
echo }^);
echo.
echo app.get^('/health', ^(req, res^) =^> {
echo   res.json^({ 
echo     status: 'healthy',
echo     timestamp: new Date^(^).toISOString^(^)
echo   }^);
echo }^);
echo.
echo // Auth routes
echo app.post^('/api/auth/login', ^(req, res^) =^> {
echo   const { email, password } = req.body;
echo   
echo   if ^(email ^&^& password^) {
echo     res.json^({
echo       success: true,
echo       message: 'Login successful',
echo       user: {
echo         id: 1,
echo         email,
echo         firstName: 'John',
echo         lastName: 'Doe',
echo         role: 'patient'
echo       },
echo       token: 'mock-jwt-token'
echo     }^);
echo   } else {
echo     res.status^(400^).json^({
echo       success: false,
echo       message: 'Email and password are required'
echo     }^);
echo   }
echo }^);
echo.
echo app.post^('/api/auth/register', ^(req, res^) =^> {
echo   const { firstName, lastName, email, password, role } = req.body;
echo   
echo   if ^(firstName ^&^& lastName ^&^& email ^&^& password^) {
echo     res.json^({
echo       success: true,
echo       message: 'Registration successful',
echo       user: {
echo         id: 1,
echo         firstName,
echo         lastName,
echo         email,
echo         role: role ^|^| 'patient'
echo       }
echo     }^);
echo   } else {
echo     res.status^(400^).json^({
echo       success: false,
echo       message: 'All fields are required'
echo     }^);
echo   }
echo }^);
echo.
echo // User routes
echo app.get^('/api/users/profile', ^(req, res^) =^> {
echo   res.json^({
echo     id: 1,
echo     firstName: 'John',
echo     lastName: 'Doe',
echo     email: 'john@example.com',
echo     role: 'patient',
echo     createdAt: new Date^(^).toISOString^(^)
echo   }^);
echo }^);
echo.
echo // Appointments routes
echo app.get^('/api/appointments', ^(req, res^) =^> {
echo   res.json^({
echo     appointments: [
echo       {
echo         id: 1,
echo         doctorName: 'Dr. Smith',
echo         date: '2024-01-15T10:00:00Z',
echo         status: 'scheduled',
echo         type: 'consultation'
echo       },
echo       {
echo         id: 2,
echo         doctorName: 'Dr. Johnson',
echo         date: '2024-01-20T14:30:00Z',
echo         status: 'confirmed',
echo         type: 'follow-up'
echo       }
echo     ]
echo   }^);
echo }^);
echo.
echo app.post^('/api/appointments', ^(req, res^) =^> {
echo   const { doctorId, date, type } = req.body;
echo   
echo   res.json^({
echo     success: true,
echo     message: 'Appointment created successfully',
echo     appointment: {
echo       id: 3,
echo       doctorId,
echo       date,
echo       type,
echo       status: 'scheduled'
echo     }
echo   }^);
echo }^);
echo.
echo // Doctors routes
echo app.get^('/api/doctors', ^(req, res^) =^> {
echo   res.json^({
echo     doctors: [
echo       {
echo         id: 1,
echo         name: 'Dr. Smith',
echo         specialization: 'General Medicine',
echo         experience: 10,
echo         rating: 4.8,
echo         consultationFee: 100
echo       },
echo       {
echo         id: 2,
echo         name: 'Dr. Johnson',
echo         specialization: 'Cardiology',
echo         experience: 15,
echo         rating: 4.9,
echo         consultationFee: 150
echo       }
echo     ]
echo   }^);
echo }^);
echo.
echo // Error handling middleware
echo app.use^(^(err, req, res, next^) =^> {
echo   console.error^(err.stack^);
echo   res.status^(500^).json^({
echo     success: false,
echo     message: 'Something went wrong!'
echo   }^);
echo }^);
echo.
echo // 404 handler
echo app.use^('*', ^(req, res^) =^> {
echo   res.status^(404^).json^({
echo     success: false,
echo     message: 'Route not found'
echo   }^);
echo }^);
echo.
echo app.listen^(PORT, '0.0.0.0', ^(^) =^> {
echo   console.log^(`🚀 VirtualDoc API server running on port ${PORT}`^);
echo   console.log^(`📊 Health check: http://localhost:${PORT}/health`^);
echo   console.log^(`📚 API docs: http://localhost:${PORT}/`^);
echo }^);
) > "backend\src\index.js"

REM Create simple frontend pages
if not exist "frontend\src\pages" mkdir "frontend\src\pages"

REM Create Landing page
(
echo import React from 'react';
echo import { Link } from 'react-router-dom';
echo.
echo const Landing: React.FC = ^(^) =^> {
echo   return ^(
echo     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
echo       {/* Header */}
echo       <header className="bg-white shadow-sm">
echo         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
echo           <div className="flex justify-between items-center py-6">
echo             <div className="flex items-center">
echo               <h1 className="text-2xl font-bold text-indigo-600">VirtualDoc</h1>
echo             </div>
echo             <div className="flex space-x-4">
echo               <Link
echo                 to="/login"
echo                 className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
echo               >
echo                 Sign In
echo               </Link>
echo               <Link
echo                 to="/register"
echo                 className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
echo               >
echo                 Get Started
echo               </Link>
echo             </div>
echo           </div>
echo         </div>
echo       </header>
echo.
echo       {/* Hero Section */}
echo       <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
echo         <div className="text-center">
echo           <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
echo             Virtual Healthcare
echo             <span className="text-indigo-600"> Made Simple</span>
echo           </h1>
echo           <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
echo             Connect with healthcare professionals from anywhere. 
echo             Book appointments, get consultations, and manage your health 
echo             with our easy-to-use platform.
echo           </p>
echo           <div className="flex flex-col sm:flex-row gap-4 justify-center">
echo             <Link
echo               to="/register"
echo               className="bg-indigo-600 text-white hover:bg-indigo-700 px-8 py-3 rounded-lg text-lg font-medium"
echo             >
echo               Start Your Journey
echo             </Link>
echo             <Link
echo               to="/login"
echo               className="border border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 rounded-lg text-lg font-medium"
echo             >
echo               Sign In
echo             </Link>
echo           </div>
echo         </div>
echo       </main>
echo     </div>
echo   ^);
echo };
echo.
echo export default Landing;
) > "frontend\src\pages\Landing.tsx"

REM Create Login page
(
echo import React, { useState } from 'react';
echo import { Link } from 'react-router-dom';
echo.
echo const Login: React.FC = ^(^) =^> {
echo   const [formData, setFormData] = useState^({
echo     email: '',
echo     password: ''
echo   }^);
echo.
echo   const handleSubmit = ^(e: React.FormEvent^) =^> {
echo     e.preventDefault^(^);
echo     console.log^('Login attempt:', formData^);
echo   };
echo.
echo   const handleChange = ^(e: React.ChangeEvent<HTMLInputElement>^) =^> {
echo     setFormData^({
echo       ...formData,
echo       [e.target.name]: e.target.value
echo     }^);
echo   };
echo.
echo   return ^(
echo     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
echo       <div className="sm:mx-auto sm:w-full sm:max-w-md">
echo         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
echo           Sign in to your account
echo         </h2>
echo         <p className="mt-2 text-center text-sm text-gray-600">
echo           Or{' '}
echo           <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
echo             create a new account
echo           </Link>
echo         </p>
echo       </div>
echo.
echo       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
echo         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
echo           <form className="space-y-6" onSubmit={handleSubmit}>
echo             <div>
echo               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
echo                 Email address
echo               </label>
echo               <div className="mt-1">
echo                 <input
echo                   id="email"
echo                   name="email"
echo                   type="email"
echo                   autoComplete="email"
echo                   required
echo                   value={formData.email}
echo                   onChange={handleChange}
echo                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
echo                 />
echo               </div>
echo             </div>
echo.
echo             <div>
echo               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
echo                 Password
echo               </label>
echo               <div className="mt-1">
echo                 <input
echo                   id="password"
echo                   name="password"
echo                   type="password"
echo                   autoComplete="current-password"
echo                   required
echo                   value={formData.password}
echo                   onChange={handleChange}
echo                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
echo                 />
echo               </div>
echo             </div>
echo.
echo             <div>
echo               <button
echo                 type="submit"
echo                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
echo               >
echo                 Sign in
echo               </button>
echo             </div>
echo           </form>
echo         </div>
echo       </div>
echo     </div>
echo   ^);
echo };
echo.
echo export default Login;
) > "frontend\src\pages\Login.tsx"

REM Create Register page
(
echo import React, { useState } from 'react';
echo import { Link } from 'react-router-dom';
echo.
echo const Register: React.FC = ^(^) =^> {
echo   const [formData, setFormData] = useState^({
echo     firstName: '',
echo     lastName: '',
echo     email: '',
echo     password: '',
echo     confirmPassword: '',
echo     role: 'patient'
echo   }^);
echo.
echo   const handleSubmit = ^(e: React.FormEvent^) =^> {
echo     e.preventDefault^(^);
echo     console.log^('Registration attempt:', formData^);
echo   };
echo.
echo   const handleChange = ^(e: React.ChangeEvent<HTMLInputElement ^| HTMLSelectElement>^) =^> {
echo     setFormData^({
echo       ...formData,
echo       [e.target.name]: e.target.value
echo     }^);
echo   };
echo.
echo   return ^(
echo     <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
echo       <div className="sm:mx-auto sm:w-full sm:max-w-md">
echo         <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
echo           Create your account
echo         </h2>
echo         <p className="mt-2 text-center text-sm text-gray-600">
echo           Or{' '}
echo           <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
echo             sign in to your existing account
echo           </Link>
echo         </p>
echo       </div>
echo.
echo       <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
echo         <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
echo           <form className="space-y-6" onSubmit={handleSubmit}>
echo             <div className="grid grid-cols-2 gap-4">
echo               <div>
echo                 <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
echo                   First name
echo                 </label>
echo                 <div className="mt-1">
echo                   <input
echo                     id="firstName"
echo                     name="firstName"
echo                     type="text"
echo                     autoComplete="given-name"
echo                     required
echo                     value={formData.firstName}
echo                     onChange={handleChange}
echo                     className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
echo                   />
echo                 </div>
echo               </div>
echo.
echo               <div>
echo                 <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
echo                   Last name
echo                 </label>
echo                 <div className="mt-1">
echo                   <input
echo                     id="lastName"
echo                     name="lastName"
echo                     type="text"
echo                     autoComplete="family-name"
echo                     required
echo                     value={formData.lastName}
echo                     onChange={handleChange}
echo                     className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
echo                   />
echo                 </div>
echo               </div>
echo             </div>
echo.
echo             <div>
echo               <label htmlFor="email" className="block text-sm font-medium text-gray-700">
echo                 Email address
echo               </label>
echo               <div className="mt-1">
echo                 <input
echo                   id="email"
echo                   name="email"
echo                   type="email"
echo                   autoComplete="email"
echo                   required
echo                   value={formData.email}
echo                   onChange={handleChange}
echo                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
echo                 />
echo               </div>
echo             </div>
echo.
echo             <div>
echo               <label htmlFor="role" className="block text-sm font-medium text-gray-700">
echo                 I am a
echo               </label>
echo               <div className="mt-1">
echo                 <select
echo                   id="role"
echo                   name="role"
echo                   value={formData.role}
echo                   onChange={handleChange}
echo                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
echo                 >
echo                   <option value="patient">Patient</option>
echo                   <option value="doctor">Doctor</option>
echo                   <option value="admin">Administrator</option>
echo                 </select>
echo               </div>
echo             </div>
echo.
echo             <div>
echo               <label htmlFor="password" className="block text-sm font-medium text-gray-700">
echo                 Password
echo               </label>
echo               <div className="mt-1">
echo                 <input
echo                   id="password"
echo                   name="password"
echo                   type="password"
echo                   autoComplete="new-password"
echo                   required
echo                   value={formData.password}
echo                   onChange={handleChange}
echo                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
echo                 />
echo               </div>
echo             </div>
echo.
echo             <div>
echo               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
echo                 Confirm password
echo               </label>
echo               <div className="mt-1">
echo                 <input
echo                   id="confirmPassword"
echo                   name="confirmPassword"
echo                   type="password"
echo                   autoComplete="new-password"
echo                   required
echo                   value={formData.confirmPassword}
echo                   onChange={handleChange}
echo                   className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
echo                 />
echo               </div>
echo             </div>
echo.
echo             <div>
echo               <button
echo                 type="submit"
echo                 className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
echo               >
echo                 Create account
echo               </button>
echo             </div>
echo           </form>
echo         </div>
echo       </div>
echo     </div>
echo   ^);
echo };
echo.
echo export default Register;
) > "frontend\src\pages\Register.tsx"

REM Create Dashboard page
(
echo import React from 'react';
echo import { Link } from 'react-router-dom';
echo.
echo const Dashboard: React.FC = ^(^) =^> {
echo   return ^(
echo     <div className="min-h-screen bg-gray-50">
echo       {/* Header */}
echo       <header className="bg-white shadow">
echo         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
echo           <div className="flex justify-between items-center py-6">
echo             <div className="flex items-center">
echo               <h1 className="text-2xl font-bold text-indigo-600">VirtualDoc</h1>
echo             </div>
echo             <div className="flex items-center space-x-4">
echo               <span className="text-gray-700">Welcome, John Doe</span>
echo               <button className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">
echo                 Sign Out
echo               </button>
echo             </div>
echo           </div>
echo         </div>
echo       </header>
echo.
echo       <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
echo         <div className="px-4 py-6 sm:px-0">
echo           <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
echo             <div className="text-center">
echo               <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
echo               <p className="text-gray-600 mb-6">This is where your main application content will go.</p>
echo               <div className="space-x-4">
echo                 <Link
echo                   to="/"
echo                   className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-md text-sm font-medium"
echo                 >
echo                   Back to Home
echo                 </Link>
echo                 <button className="bg-gray-600 text-white hover:bg-gray-700 px-4 py-2 rounded-md text-sm font-medium">
echo                   Get Started
echo                 </button>
echo               </div>
echo             </div>
echo           </div>
echo         </div>
echo       </main>
echo     </div>
echo   ^);
echo };
echo.
echo export default Dashboard;
) > "frontend\src\pages\Dashboard.tsx"

echo [OK] Simple project structure created

REM Install dependencies if Node.js is available
if "%NODE_INSTALLED%"=="true" (
    echo [INFO] Installing dependencies...
    
    REM Install frontend dependencies
    cd frontend
    call npm install
    cd ..
    
    REM Install backend dependencies
    cd backend
    call npm install
    cd ..
    
    echo [OK] Dependencies installed
)

REM Start the application
echo [INFO] Starting VirtualDoc...
docker-compose up -d

REM Wait for services to be ready
echo [INFO] Waiting for services to start...
timeout /t 15 /nobreak >nul

REM Check if services are running
docker ps | findstr virtualdoc-frontend >nul
if %errorlevel% equ 0 (
    echo [OK] Frontend is running
) else (
    echo [ERROR] Frontend failed to start
)

docker ps | findstr virtualdoc-backend >nul
if %errorlevel% equ 0 (
    echo [OK] Backend is running
) else (
    echo [ERROR] Backend failed to start
)

docker ps | findstr virtualdoc-postgres >nul
if %errorlevel% equ 0 (
    echo [OK] Database is running
) else (
    echo [ERROR] Database failed to start
)

echo.
echo ========================================
echo   🎉 VirtualDoc is ready!
echo ========================================
echo.
echo 🌐 Access your application:
echo   • Frontend: http://localhost:3000
echo   • Backend:  http://localhost:3001
echo   • Database: localhost:5432
echo.
echo 📝 Useful commands:
echo   • View logs:    docker-compose logs -f
echo   • Stop all:     docker-compose down
echo   • Restart:      docker-compose up -d
echo.
echo Happy coding! 🚀
pause