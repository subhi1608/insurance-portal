import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT as string, 10),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const query = (sql: string, args?: unknown[]) => pool.query(sql, args);

const checkHealth = async (): Promise<void> => {
  const client = await pool.connect();
  client.release();
};

export default { query, checkHealth };
