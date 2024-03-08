const db = require("../db/index.js");

const getAllClients = async () => {
	const { query } = db.createConnection();
	try {
		const _sql = `select * from client`;
		const data = await query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	}
};

const getClientById = async (clientId) => {
	const { query } = db.createConnection();
	try {
		const _sql = {
			name: "get-client",
			text: `select * from client where id = $1`,
			values: [clientId],
		};
		const data = await query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	}
};

const createClient = async (reqBody) => {
	const { query } = db.createConnection();
	const { name, date_of_birth, address, contact } = reqBody;
	try {
		const _sql = {
			name: "create-client",
			text: `insert into client(name,date_of_birth,address,contact) values ($1,$2,$3,$4) returning *`,
			values: [name, date_of_birth, address, contact],
		};
		const data = await query(_sql);
		return data.rows[0].id;
	} catch (error) {
		throw error;
	}
};

const updateClient = async (id, reqBody) => {
	const { query } = db.createConnection();
	const { name, date_of_birth, address, contact } = reqBody;
	try {
		const _sql = {
			name: "update-client",
			text: `update client set name=$1,date_of_birth=$2,address=$3,contact=$4  where id=$5`,
			values: [name, date_of_birth, address, contact, id],
		};
		await query(_sql);
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
		await query(_sqltext, clientId);

		_sqltext = `delete from client where id = $1`;
		await query(_sqltext, clientId);

		return "deleted";
	} catch (error) {
		throw error;
	}
};

const createUser = async (reqBody) => {
	const { query } = db.createConnection();
	const { email, password } = reqBody;
	try {
		const _sql = {
			name: "create-user",
			text: `insert into users(email,password) values ($1,$2) returning *`,
			values: [email, password],
		};
		const data = await query(_sql);
		return data.rows[0].id;
	} catch (error) {
		throw error;
	}
};

const getUserByEmail = async (email, password) => {
	const { query } = db.createConnection();
	try {
		const _sql = {
			name: "get-user",
			text: `select * from users where email = $1 and password=$2`,
			values: [email, password],
		};
		const data = await query(_sql);
		return data.rows[0];
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
	createUser,
	getUserByEmail,
};

module.exports = client;
