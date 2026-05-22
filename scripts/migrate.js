require("dotenv").config({ path: ".env" });

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

const pool = new Pool({
	user: process.env.DB_USER,
	host: process.env.DB_HOST,
	database: process.env.DB,
	password: process.env.DB_PASSWORD,
	port: parseInt(process.env.DB_PORT, 10),
});

async function migrate() {
	const migrationsDir = path.join(__dirname, "..", "migrations");
	const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

	for (const file of files) {
		const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
		console.log(`Running ${file}...`);
		await pool.query(sql);
		console.log(`  ✓ ${file}`);
	}
}

migrate()
	.then(() => {
		console.log("All migrations completed.");
		process.exit(0);
	})
	.catch((err) => {
		console.error("Migration failed:", err.message);
		process.exit(1);
	})
	.finally(() => pool.end());
