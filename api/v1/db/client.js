const db = require("../db/index.js");

const getAllClients = async () => {
	const { pool } = db.createConnection();
	try {
		const _sql = `select * from client`;
		const data = await pool.query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	} finally {
	}
};

const getClientById = async (clientId) => {
	const { pool } = db.createConnection();
	try {
		const _sql = {
			name: "get-client",
			text: `select * from client where id = $1`,
			values: [clientId],
		};
		const data = await pool.query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	} finally {
	}
};

const createClient = async (reqBody) => {
	const { pool } = db.createConnection();
	const { name, date_of_birth, address, contact } = reqBody;
	try {
		const _sql = {
			name: "create-client",
			text: `insert into client(name,date_of_birth,address,contact) values ($1,$2,$3,$4) returning *`,
			values: [name, date_of_birth, address, contact],
		};
		const data = await pool.query(_sql);
		return data.rows[0].id;
	} catch (error) {
		throw error;
	} finally {
	}
};

const updateClient = async (id, reqBody) => {
	const { pool } = db.createConnection();
	const { name, date_of_birth, address, contact } = reqBody;
	console.log("reqBody", reqBody, id);
	try {
		const _sql = {
			name: "update-client",
			text: `update client set name=$1,date_of_birth=$2,address=$3,contact=$4  where id=$5`,
			values: [name, date_of_birth, address, contact, id],
		};
		const data = await pool.query(_sql);
		return data.rows[0].id;
	} catch (error) {
		throw error;
	} finally {
	}
};

const deleteClient = async (clientId) => {
	const { pool } = db.createConnection();
	try {
		const _sql = {
			name: "delete-client",
			text: `delete from client where id = $1`,
			values: [clientId],
		};
		const data = await pool.query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	} finally {
	}
};

const client = {
	getAllClients,
	getClientById,
	createClient,
	updateClient,
	deleteClient,
};

module.exports = client;
