const { Pool } = require("pg");

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB,
	password: process.env.DB_PASSWORD,
	port: parseInt(process.env.DB_PORT, 10),
	max: 20,
	idleTimeoutMillis: 30000,
	connectionTimeoutMillis: 2000,
});

const query = (sql, args) => pool.query(sql, args);

const checkHealth = async () => {
	const client = await pool.connect();
	client.release();
};

module.exports = { query, checkHealth };
