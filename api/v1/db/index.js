const util = require("util");
const mysql = require("mysql2");
const Pool = require("pg").Pool;

const db = {
	createConnection: () => {
		const pool = new Pool({
			user: "postgres",
			host: "localhost",
			database: "insurance_management",
			password: "root",
			port: 5432,
		});
		// return { pool };
		return {
			query: (sql, args) => {
				return util.promisify(pool.query).call(pool, sql, args);
			},
			close: () => {
				return util.promisify(pool.end).call(pool);
			},
			beginTransaction: () => {
				return util.promisify(pool.beginTransaction).call(pool);
			},
			commit: () => {
				return util.promisify(connection.commit).call(connection);
			},
			rollback: () => {
				return util.promisify(connection.rollback).call(connection);
			},
		};
	},
};

module.exports = db;
