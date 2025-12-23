import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const SALT_ROUNDS = 12;

// Database configuration
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    let url = process.env.DATABASE_URL;
    if (url.startsWith('postgres://')) {
      url = url.replace('postgres://', 'postgresql://');
    }
    return { connectionString: url };
  }

  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'virtualdoc',
    user: process.env.DB_USER || 'virtualdoc',
    password: process.env.DB_PASSWORD || 'virtualdoc123',
  };
};

const pool = new Pool(getDatabaseConfig());

// Common password for all test users: Test123!@#
const TEST_PASSWORD = 'Test123!@#';

interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  adminRoleCode?: string;
  phone?: string;
}

const testUsers: TestUser[] = [
  // Universal Admin (Super Admin)
  {
    email: 'admin@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Super',
    lastName: 'Admin',
    role: 'super_admin',
    adminRoleCode: 'universal_admin',
    phone: '+1234567890',
  },
  // Sub Admin
  {
    email: 'subadmin@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Sub',
    lastName: 'Admin',
    role: 'sub_admin',
    adminRoleCode: 'sub_admin',
    phone: '+1234567891',
  },
  // Tenant Admin
  {
    email: 'tenantadmin@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Tenant',
    lastName: 'Admin',
    role: 'admin',
    adminRoleCode: 'tenant_admin',
    phone: '+1234567892',
  },
  // Doctor
  {
    email: 'doctor@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'John',
    lastName: 'Doctor',
    role: 'doctor',
    phone: '+1234567893',
  },
  // Nurse
  {
    email: 'nurse@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Jane',
    lastName: 'Nurse',
    role: 'nurse',
    phone: '+1234567894',
  },
  // Staff
  {
    email: 'staff@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Bob',
    lastName: 'Staff',
    role: 'staff',
    phone: '+1234567895',
  },
  // Receptionist
  {
    email: 'receptionist@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Alice',
    lastName: 'Receptionist',
    role: 'receptionist',
    phone: '+1234567896',
  },
  // Patient
  {
    email: 'patient@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Patient',
    lastName: 'User',
    role: 'patient',
    phone: '+1234567897',
  },
  // Lab Technician
  {
    email: 'labtech@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Lab',
    lastName: 'Technician',
    role: 'lab_technician',
    phone: '+1234567898',
  },
  // Chemist
  {
    email: 'chemist@virtualdoc.com',
    password: TEST_PASSWORD,
    firstName: 'Pharmacy',
    lastName: 'Chemist',
    role: 'chemist',
    phone: '+1234567899',
  },
];

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function ensureAdminRoles(client: any) {
  const roles = [
    {
      role_code: 'universal_admin',
      role_name: 'Universal Admin',
      role_description: 'Full access to entire platform',
      hierarchy_level: 1,
      permissions: JSON.stringify(['*']),
      can_manage_users: true,
      can_manage_tenants: true,
      can_manage_admins: true,
      can_access_analytics: true,
      can_manage_billing: true,
      can_configure_system: true,
      scope: 'global',
    },
    {
      role_code: 'sub_admin',
      role_name: 'Sub Admin',
      role_description: 'Limited admin access',
      hierarchy_level: 2,
      permissions: JSON.stringify(['users.read', 'users.write', 'analytics.read']),
      can_manage_users: true,
      can_manage_tenants: false,
      can_manage_admins: false,
      can_access_analytics: true,
      can_manage_billing: false,
      can_configure_system: false,
      scope: 'global',
    },
    {
      role_code: 'tenant_admin',
      role_name: 'Tenant Admin',
      role_description: 'Tenant-specific admin access',
      hierarchy_level: 3,
      permissions: JSON.stringify(['users.read', 'users.write', 'analytics.read']),
      can_manage_users: true,
      can_manage_tenants: false,
      can_manage_admins: false,
      can_access_analytics: true,
      can_manage_billing: false,
      can_configure_system: false,
      scope: 'tenant',
    },
  ];

  for (const role of roles) {
    const existing = await client.query(
      'SELECT id FROM admin_roles WHERE role_code = $1',
      [role.role_code]
    );

    if (existing.rows.length === 0) {
      await client.query(
        `INSERT INTO admin_roles (
          role_code, role_name, role_description, hierarchy_level,
          permissions, can_manage_users, can_manage_tenants, can_manage_admins,
          can_access_analytics, can_manage_billing, can_configure_system,
          scope, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [
          role.role_code,
          role.role_name,
          role.role_description,
          role.hierarchy_level,
          role.permissions,
          role.can_manage_users,
          role.can_manage_tenants,
          role.can_manage_admins,
          role.can_access_analytics,
          role.can_manage_billing,
          role.can_configure_system,
          role.scope,
          true,
        ]
      );
      console.log(`✓ Created admin role: ${role.role_code}`);
    } else {
      console.log(`✓ Admin role already exists: ${role.role_code}`);
    }
  }
}

async function seedUsers() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    console.log('🌱 Starting user seed process...\n');

    // Ensure admin roles exist
    console.log('📋 Ensuring admin roles exist...');
    await ensureAdminRoles(client);

    console.log('\n👥 Creating test users...\n');

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [userData.email.toLowerCase()]
      );

      let user;
      if (existingUser.rows.length > 0) {
        user = existingUser.rows[0];
        console.log(`⚠️  User already exists: ${userData.email}`);
        
        // Check if admin_users record exists
        const existingAdmin = await client.query(
          'SELECT id FROM admin_users WHERE user_id = $1',
          [user.id]
        );
        
        if (existingAdmin.rows.length === 0) {
          // Create admin_users entry for existing user
          const adminRoleCode = userData.adminRoleCode || 'tenant_admin';
          const roleResult = await client.query(
            'SELECT id FROM admin_roles WHERE role_code = $1',
            [adminRoleCode]
          );

          if (roleResult.rows.length > 0) {
            const adminRoleId = roleResult.rows[0].id;
            await client.query(
              `INSERT INTO admin_users (
                user_id, tenant_id, admin_role_id, admin_role_code,
                is_active, created_at, updated_at
              ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
              [user.id, null, adminRoleId, adminRoleCode, true]
            );
            console.log(`  └─ Created admin_users record with role: ${adminRoleCode}`);
          }
        } else {
          console.log(`  └─ Admin_users record already exists`);
        }
        continue;
      }

      // Hash password
      const passwordHash = await hashPassword(userData.password);

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (
          tenant_id, email, password_hash, first_name, last_name, phone, role,
          email_verified, phone_verified, is_active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING *`,
        [
          null, // tenant_id (null for universal admin, can be set for tenant-specific users)
          userData.email.toLowerCase(),
          passwordHash,
          userData.firstName,
          userData.lastName,
          userData.phone || null,
          userData.role,
          true, // email_verified (for test users)
          true, // phone_verified (for test users)
          true, // is_active
        ]
      );

      user = userResult.rows[0];
      console.log(`✓ Created user: ${userData.email} (${userData.role})`);

      // Create admin_users entry for all users (required for login)
      // Use the specified adminRoleCode or default to tenant_admin for non-admin users
      const adminRoleCode = userData.adminRoleCode || 'tenant_admin';
      
      const roleResult = await client.query(
        'SELECT id FROM admin_roles WHERE role_code = $1',
        [adminRoleCode]
      );

      if (roleResult.rows.length > 0) {
        const adminRoleId = roleResult.rows[0].id;

        await client.query(
          `INSERT INTO admin_users (
            user_id, tenant_id, admin_role_id, admin_role_code,
            is_active, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [user.id, null, adminRoleId, adminRoleCode, true]
        );
        console.log(`  └─ Linked to admin role: ${adminRoleCode}`);
      } else {
        console.log(`  ⚠️  Warning: Admin role ${adminRoleCode} not found, user may not be able to login`);
      }
    }

    await client.query('COMMIT');
    console.log('\n✅ User seed completed successfully!\n');
    console.log('📝 Test User Credentials:');
    console.log('=' .repeat(60));
    testUsers.forEach((user) => {
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`Role: ${user.role}${user.adminRoleCode ? ` (${user.adminRoleCode})` : ''}`);
      console.log('-'.repeat(60));
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error seeding users:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the seed
seedUsers()
  .then(() => {
    console.log('\n🎉 Seed script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed script failed:', error);
    process.exit(1);
  });

