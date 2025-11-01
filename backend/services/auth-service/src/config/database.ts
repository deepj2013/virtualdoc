import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load .env file only if not in Docker (Docker passes env vars directly)
if (!process.env.DOCKER_ENV) {
  dotenv.config();
}

// Get database connection string or config
const getDatabaseConfig = () => {
  // Priority 1: Use DATABASE_URL if provided
  if (process.env.DATABASE_URL) {
    // Ensure postgres:// is converted to postgresql:// for pg library
    let url = process.env.DATABASE_URL;
    if (url.startsWith('postgres://')) {
      url = url.replace('postgres://', 'postgresql://');
    }
    
    const parsedUrl = new URL(url);
    console.log('✅ Using DATABASE_URL');
    console.log('   Host:', parsedUrl.hostname);
    console.log('   Port:', parsedUrl.port || '5432');
    console.log('   Database:', parsedUrl.pathname.slice(1));
    
    return { connectionString: url };
  }

  // Priority 2: Use individual environment variables
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const database = process.env.DB_NAME || 'virtualdoc';
  const user = process.env.DB_USER || 'virtualdoc';
  const password = process.env.DB_PASSWORD || 'virtualdoc123';
  
  console.log('✅ Using individual DB vars');
  console.log('   Host:', host);
  console.log('   Port:', port);
  console.log('   Database:', database);
  
  return {
    host,
    port,
    database,
    user,
    password,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
};

const dbConfig = getDatabaseConfig();

export const pool = new Pool(dbConfig);

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error });
    throw error;
  }
};

// Helper function for transactions
export const transaction = async (callback: (client: any) => Promise<any>) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export default pool;

