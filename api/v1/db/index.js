const path = require("path");
const util = require("util");
const Pool = require("pg").Pool;

require("dotenv").config({
	path: path.resolve(process.cwd(), "example.env"),
});

const db = {
	createConnection: async () => {
		const options = {
			user: process.env.DB_USER,
			host: process.env.DB_HOST,
			database: process.env.DB,
			password: process.env.DB_PASSWORD,
			port: process.env.DB_PORT,
		};
		const pool = new Pool(options);
		return {
			query: (sql, args) => {
				return util.promisify(pool.query).call(pool, sql, args);
			},
			close: () => {
				return util.promisify(pool.end).call(pool);
			},
		};
	},
};

module.exports = db;
