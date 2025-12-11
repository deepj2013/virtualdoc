import { Pool } from 'pg';
import dotenv from 'dotenv';

// Load .env file only if not in Docker
if (!process.env.DOCKER_ENV) {
  dotenv.config();
}

// Get database connection string or config
const getDatabaseConfig = () => {
  // Priority 1: Use DATABASE_URL if provided
  if (process.env.DATABASE_URL) {
    let url = process.env.DATABASE_URL;
    if (url.startsWith('postgres://')) {
      url = url.replace('postgres://', 'postgresql://');
    }
    return { connectionString: url };
  }

  // Priority 2: Use individual environment variables
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const database = process.env.DB_NAME || 'virtualdoc';
  const user = process.env.DB_USER || 'virtualdoc';
  const password = process.env.DB_PASSWORD || 'virtualdoc123';
  
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

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { duration, rows: res.rowCount });
    return res;
  } catch (error: any) {
    console.error('Database query failed', { error: error.message });
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

