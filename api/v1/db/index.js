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
		return { pool };
		// return {
		// 	query: () => {
		// 		return util.promisify(connection.query).call(connection, sql, args);
		// 	},
		// 	close: () => {
		// 		return util.promisify(connection.end).call(connection);
		// 	},
		// 	beginTransaction: () => {
		// 		return util.promisify(connection.beginTransaction).call(connection);
		// 	},
		// 	commit: () => {
		// 		return util.promisify(connection.commit).call(connection);
		// 	},
		// 	rollback: () => {
		// 		return util.promisify(connection.rollback).call(connection);
		// 	},
		// };
	},
};

module.exports = db;
