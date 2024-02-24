const db = require("../db/index.js");

const getAllClients = async () => {
	const { pool } = db.createConnection();
	try {
		const _sql = `select * from client`;
		const data = await pool.query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
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
		await pool.query(_sql);
		return "updated";
	} catch (error) {
		throw error;
	}
};

const deleteClient = async (clientId) => {
	const { query } = db.createConnection();
	try {
		let _sql = {
			name: "get-insurance-policy",
			text: `select id from insurance_policy where client_id=$1`,
			values: [clientId],
			rowMode: "array",
		};
		let resp = await query(_sql);

		let claimsArr = resp?.rows && resp?.rows?.map((item) => item[0]);
		_sqltext = `delete from insurance_claim where insurance_policy_id in (${claimsArr})`;
		await query(_sqltext);

		_sqltext = `delete from insurance_policy where client_id=$1`;
		await pool.query(_sqltext, clientId);

		_sqltext = `delete from client where id = $1`;
		await pool.query(_sqltext, clientId);

		return "deleted";
	} catch (error) {
		throw error;
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
