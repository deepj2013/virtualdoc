# Test User Credentials

This document contains the test user credentials for different roles in the VirtualDoc system.

## 🔐 Common Password

All test users use the same password for convenience:
```
Test123!@#
```

## 👥 Test Users

### 1. Universal Admin (Super Admin)
- **Email:** `admin@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `super_admin`
- **Admin Role Code:** `universal_admin`
- **Access:** Full access to entire platform

### 2. Sub Admin
- **Email:** `subadmin@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `sub_admin`
- **Admin Role Code:** `sub_admin`
- **Access:** Limited admin access

### 3. Tenant Admin
- **Email:** `tenantadmin@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `admin`
- **Admin Role Code:** `tenant_admin`
- **Access:** Tenant-specific admin access

### 4. Doctor
- **Email:** `doctor@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `doctor`
- **Access:** Medical professional access

### 5. Nurse
- **Email:** `nurse@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `nurse`
- **Access:** Nursing staff access

### 6. Staff
- **Email:** `staff@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `staff`
- **Access:** General staff access

### 7. Receptionist
- **Email:** `receptionist@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `receptionist`
- **Access:** Front desk access

### 8. Patient
- **Email:** `patient@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `patient`
- **Access:** Patient portal access

### 9. Lab Technician
- **Email:** `labtech@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `lab_technician`
- **Access:** Laboratory access

### 10. Chemist
- **Email:** `chemist@virtualdoc.com`
- **Password:** `Test123!@#`
- **Role:** `chemist`
- **Access:** Pharmacy access

## 🚀 How to Seed Users

### Option 1: Using TypeScript Script (Recommended)

```bash
cd backend/services/auth-service
npx ts-node ../../database/seed-users.ts
```

### Option 2: Using npm script (if added to package.json)

```bash
cd backend/services/auth-service
npm run seed
```

## 📝 Notes

- All users are created with `email_verified: true` and `phone_verified: true` for testing convenience
- All users are set to `is_active: true`
- **All users are linked to `admin_users` table** - This is required for login through the `/api/admin/auth/login` endpoint
- Admin users are linked to their specific admin roles (universal_admin, sub_admin, tenant_admin)
- Non-admin users (doctor, nurse, patient, etc.) are linked to `tenant_admin` role for login purposes
- The seed script will skip users that already exist, but will create missing `admin_users` records for existing users (idempotent)

## 🔒 Security Warning

⚠️ **These are test credentials only!** 
- Do NOT use these passwords in production
- Change all passwords before deploying to production
- These credentials are for development and testing purposes only

