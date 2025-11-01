# 🚀 VirtualDoc Development Guide

## Single Port Development (Recommended)

### Quick Start
```bash
# Start development server on port 3003
./dev.sh          # macOS/Linux
dev.bat           # Windows
npm run dev       # Any platform
```

### What You Get
- **Single Port**: Everything runs on http://localhost:3003
- **Hot Reload**: Instant updates when you save files
- **TypeScript**: Full type checking and IntelliSense
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **Modern UI**: Beautiful, responsive components

### Features Available
- ✅ **Landing Page**: Three-tier pricing (Community/Professional/Enterprise)
- ✅ **Role Selection**: Choose your user type
- ✅ **Responsive Design**: Works on all devices
- ✅ **Modern UI**: Clean, professional healthcare design
- ✅ **Navigation**: Seamless routing between pages
- ✅ **Authentication**: Login/Register pages (mock)

## Full Docker Setup (Production-like)

### Quick Start
```bash
# Start all services with Docker
./start.sh        # macOS/Linux
start.bat         # Windows
```

### What You Get
- **Web App**: http://localhost:3003 (Vite dev server)
- **Docker Web App**: http://localhost:3004 (Docker container)
- **Mock API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

## Development Workflow

### 1. Start Development
```bash
./dev.sh
```

### 2. Open Browser
- Navigate to http://localhost:3003
- See the landing page with three-tier pricing
- Click "Get Started" to see registration
- Click "Sign In" to see login

### 3. Edit Code
- Edit files in `frontend/web-app/src/`
- See changes instantly in browser
- Hot reload preserves state

### 4. Add New Pages
```bash
# Create new page
mkdir frontend/web-app/src/pages/NewPage
touch frontend/web-app/src/pages/NewPage/NewPage.tsx

# Add route in App.tsx
<Route path="/new-page" element={<NewPage />} />
```

## Project Structure

```
frontend/web-app/
├── src/
│   ├── pages/
│   │   ├── Landing/          # Landing page with pricing
│   │   ├── Contact/          # Contact page
│   │   ├── Auth/             # Login/Register
│   │   └── Dashboard/        # App pages
│   ├── components/
│   │   └── Layout/           # Navigation layout
│   ├── hooks/
│   └── App.tsx              # Main app with routing
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## Available Scripts

```bash
# Development
npm run dev              # Start dev server
./dev.sh                 # Start dev server (macOS/Linux)
dev.bat                  # Start dev server (Windows)

# Docker
npm run dev:docker       # Start with Docker
./start.sh               # Start with Docker (macOS/Linux)
start.bat                # Start with Docker (Windows)

# Frontend only
npm run frontend         # Start frontend dev server
npm run frontend:build   # Build frontend
npm run frontend:install # Install frontend dependencies
```

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3003
lsof -ti:3003 | xargs kill -9    # macOS/Linux
netstat -ano | findstr :3003     # Windows
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Build Issues
```bash
# Clear Vite cache
rm -rf .vite
npm run dev
```

## Next Steps

1. **Customize Landing Page**: Edit `src/pages/Landing/Landing.tsx`
2. **Add New Features**: Create components in `src/components/`
3. **Update Styling**: Modify `tailwind.config.js`
4. **Add Routes**: Update `src/App.tsx`
5. **Deploy**: Use `npm run frontend:build` for production

---

**Happy coding! 🚀**
