# 🚀 Quick Start Guide - See Your Admin Dashboard

## Step-by-Step Instructions

### Step 1: Start Database (if not running)
```bash
# Make sure Docker is running, then start database
docker-compose up -d postgres redis

# Wait 10-15 seconds for database to initialize
```

### Step 2: Create Test Users
```bash
# Navigate to auth service
cd backend/services/auth-service

# Run the seed script to create test users
npm run seed
```

**Expected output:**
```
🌱 Starting user seed process...
📋 Ensuring admin roles exist...
✓ Created admin role: universal_admin
✓ Created admin role: sub_admin
✓ Created admin role: tenant_admin

👥 Creating test users...
✓ Created user: admin@virtualdoc.com (super_admin)
  └─ Linked to admin role: universal_admin
...
✅ User seed completed successfully!
```

### Step 3: Start Backend Services

**Option A: Using Docker (Recommended)**
```bash
# From project root
cd /Volumes/Data/Product/virtualDoc

# Start all services
docker-compose up -d

# Or start just auth service
docker-compose up -d auth-service
```

**Option B: Local Development**
```bash
# Start Auth Service
cd backend/services/auth-service
npm install
npm run dev
```

The auth service will run on: **http://localhost:3001**

### Step 4: Start Frontend
```bash
# Open a new terminal window
cd frontend/apps/web-app

# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

The frontend will run on: **http://localhost:3000**

### Step 5: Login and View Dashboard

1. **Open your browser** and go to: `http://localhost:3000`

2. **Click "Admin Login"** or go directly to: `http://localhost:3000/admin/login`

3. **Login with Universal Admin credentials:**
   - **Email:** `admin@virtualdoc.com`
   - **Password:** `Test123!@#`

4. **You'll see the Admin Dashboard with:**
   - ✅ Sidebar navigation with 9 menu items
   - ✅ Dashboard overview with stats
   - ✅ Quick action buttons
   - ✅ Platform management cards

5. **Click any menu item** in the sidebar to navigate:
   - Dashboard
   - Users
   - Tenants
   - Admins
   - Analytics
   - Billing
   - Security
   - Audit Logs
   - Settings

## 🎯 What You'll See

### Dashboard Features:
- **Stats Cards:** Total Users, Active Tenants, Revenue, System Health
- **Quick Actions:** Add User, Create Tenant, Assign Admin, View Reports
- **Platform Management:** 8 feature cards linking to different sections

### Sidebar Navigation:
- **9 Menu Items** with icons and counts
- **Active section highlighting**
- **User profile** at the bottom
- **Logout button**

## 🔍 Verify Everything is Working

### Check Backend:
```bash
# Test auth service health
curl http://localhost:3001/health

# Should return: {"status":"ok","service":"appointment-service"}
```

### Check Frontend:
- Open: http://localhost:3000
- Should see the homepage
- Click "Admin Login" button

### Check Database:
```bash
# Verify users were created
docker-compose exec postgres psql -U virtualdoc -d virtualdoc -c "SELECT email, role FROM users LIMIT 5;"
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :3001

# Kill the process or change port in .env
```

### Database Connection Error
```bash
# Make sure database is running
docker-compose ps

# Check database logs
docker-compose logs postgres
```

### Frontend Not Loading
```bash
# Clear cache and rebuild
cd frontend/apps/web-app
rm -rf node_modules dist
npm install
npm run dev
```

## 📝 Test User Credentials

All users use password: `Test123!@#`

| Role | Email | Access |
|------|-------|--------|
| Universal Admin | admin@virtualdoc.com | Full access |
| Sub Admin | subadmin@virtualdoc.com | Limited admin |
| Tenant Admin | tenantadmin@virtualdoc.com | Tenant-specific |
| Doctor | doctor@virtualdoc.com | Medical access |
| Patient | patient@virtualdoc.com | Patient portal |

See `database/SEED_USERS.md` for complete list.

---

**That's it!** You should now see your full Universal Admin dashboard with all 9 menu sections working! 🎉

