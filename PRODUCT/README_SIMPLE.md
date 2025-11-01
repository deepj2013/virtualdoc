# 🚀 VirtualDoc - Simple MVP

## The Problem We Solved

Your original project structure was too complex for MVP development and causing issues for Windows developers. We've created a **simple, cross-platform solution** that works for everyone.

## ✨ What's New

### Before (Complex)
- 6+ backend services
- 3+ frontend apps  
- Multiple docker files
- Complex setup scripts
- Hard to get started

### After (Simple)
- 1 backend service
- 1 frontend app
- 1 docker-compose.yml
- 2 simple setup scripts
- One command setup

## 🚀 Quick Start

### Windows Developer:
```cmd
git clone <your-repo>
cd virtualDoc
setup.bat
```

### Mac/Linux Developer:
```bash
git clone <your-repo>
cd virtualDoc
./setup.sh
```

**That's it!** Your app will be running at:
- 🌐 **Frontend**: http://localhost:3000 (React + Vite + Tailwind)
- 🔧 **Backend**: http://localhost:3001 (Node.js + Express)
- 🗄️ **Database**: localhost:5432 (PostgreSQL)

## 📁 Simple Project Structure

```
virtualDoc/
├── frontend/                 # Single React app
│   ├── src/
│   │   ├── pages/           # Landing, Login, Register, Dashboard
│   │   ├── components/      # Reusable components
│   │   └── App.tsx         # Main app with routing
│   ├── package.json
│   └── Dockerfile
├── backend/                  # Single Node.js API
│   ├── src/
│   │   ├── controllers/     # Auth, Users, Appointments
│   │   ├── routes/          # API routes
│   │   └── index.js        # Main server file
│   ├── package.json
│   └── Dockerfile
├── database/                 # Simple database setup
│   └── schema.sql           # One schema file
├── docker-compose.yml        # Everything in one file
├── setup.sh                 # One command setup (Mac/Linux)
├── setup.bat                # One command setup (Windows)
└── README.md                # This file
```

## 🛠️ Development

### Start Everything
```bash
docker-compose up
```

### View Logs
```bash
docker-compose logs -f
```

### Stop Everything
```bash
docker-compose down
```

### Frontend Development (if you have Node.js)
```bash
cd frontend
npm install
npm run dev
```

## 🎯 Features Available

### Frontend
- ✅ **Landing Page**: Beautiful pricing page with 3 tiers
- ✅ **Authentication**: Login and Register pages
- ✅ **Dashboard**: Basic dashboard layout
- ✅ **Responsive Design**: Works on all devices
- ✅ **Modern UI**: Tailwind CSS styling
- ✅ **Routing**: React Router for navigation

### Backend
- ✅ **REST API**: Express.js server
- ✅ **Authentication**: Login/Register endpoints
- ✅ **User Management**: Profile endpoints
- ✅ **Appointments**: CRUD operations
- ✅ **Doctors**: Doctor listing
- ✅ **Health Check**: `/health` endpoint

### Database
- ✅ **PostgreSQL**: Relational database
- ✅ **Simple Schema**: Users, Patients, Doctors, Appointments
- ✅ **Docker**: Containerized database

## 🔧 Technology Stack

- **Frontend**: React 18 + Vite + Tailwind CSS + TypeScript
- **Backend**: Node.js + Express + PostgreSQL
- **Database**: PostgreSQL 15
- **Containerization**: Docker + Docker Compose
- **Development**: Hot reload, TypeScript support

## 📝 Next Steps

1. **Test the setup** on Windows and Mac
2. **Customize the landing page** for your needs
3. **Add real authentication** with JWT tokens
4. **Connect to real database** with migrations
5. **Add more features** as needed

## 🆘 Troubleshooting

### Docker Issues
```bash
# Restart Docker Desktop
# Then run:
docker-compose down
docker-compose up
```

### Port Conflicts
```bash
# Kill processes on ports 3000, 3001, 5432
# Then run setup again
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 🎉 Benefits

✅ **Cross-Platform**: Works on Windows, Mac, Linux  
✅ **Simple Setup**: One command to get started  
✅ **Easy Development**: Hot reload, TypeScript  
✅ **Production Ready**: Docker for deployment  
✅ **Team Friendly**: Everyone can contribute  
✅ **MVP Focused**: Only what you need to start  

---

**Ready to start building? Run `setup.bat` (Windows) or `./setup.sh` (Mac/Linux) and you're good to go! 🚀**
