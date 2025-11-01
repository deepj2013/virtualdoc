import { Pool } from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger';

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
    logger.logDatabaseConfig({
      connectionString: url,
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port || '5432', 10),
      database: parsedUrl.pathname.slice(1),
    });
    
    return { connectionString: url };
  }

  // Priority 2: Use individual environment variables
  const host = process.env.DB_HOST || 'localhost';
  const port = parseInt(process.env.DB_PORT || '5432', 10);
  const database = process.env.DB_NAME || 'virtualdoc';
  const user = process.env.DB_USER || 'virtualdoc';
  const password = process.env.DB_PASSWORD || 'virtualdoc123';
  
  logger.logDatabaseConfig({
    host,
    port,
    database,
  });
  
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

// Test connection (no sensitive data logged)
pool.on('connect', () => {
  logger.info('Database connection established');
});

pool.on('error', (err) => {
  logger.error('Database connection error', err, {
    errorType: 'database_connection',
  });
  process.exit(-1);
});

// Helper function to execute queries (HIPAA compliant logging)
export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query execution without PHI
    logger.logQuery(text, duration, res.rowCount || undefined);
    
    return res;
  } catch (error: any) {
    // Log error without exposing query parameters that might contain PHI
    logger.error('Database query failed', error, {
      queryLength: text.length,
      paramCount: params?.length || 0,
      errorCode: error.code,
    });
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

