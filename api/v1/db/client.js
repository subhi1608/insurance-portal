const db = require("../db/index.js");

const getAllClients = async () => {
	const data = await db.query("SELECT * FROM client");
	return data.rows;
};

const getClientById = async (clientId) => {
	const data = await db.query("SELECT * FROM client WHERE id = $1", [clientId]);
	return data.rows;
};

const createClient = async (reqBody) => {
	const { name, date_of_birth, address, contact } = reqBody;
	const data = await db.query(
		"INSERT INTO client(name, date_of_birth, address, contact) VALUES ($1, $2, $3, $4) RETURNING id",
		[name, date_of_birth, address, contact]
	);
	return data.rows[0].id;
};

const updateClient = async (id, reqBody) => {
	const { name, date_of_birth, address, contact } = reqBody;
	await db.query(
		"UPDATE client SET name=$1, date_of_birth=$2, address=$3, contact=$4 WHERE id=$5",
		[name, date_of_birth, address, contact, id]
	);
};

const deleteClient = async (clientId) => {
	const policyRows = await db.query(
		"SELECT id FROM insurance_policy WHERE client_id=$1",
		[clientId]
	);
	const policyIds = policyRows.rows.map((r) => r.id);

	if (policyIds.length) {
		await db.query(
			`DELETE FROM insurance_claim WHERE insurance_policy_id = ANY($1::int[])`,
			[policyIds]
		);
	}

	await db.query("DELETE FROM insurance_policy WHERE client_id=$1", [clientId]);
	await db.query("DELETE FROM client WHERE id=$1", [clientId]);
};

const createUser = async (reqBody) => {
	const { email, password } = reqBody;
	await db.query("DELETE FROM users WHERE email=$1", [email]);
	const data = await db.query(
		"INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id",
		[email, password]
	);
	return data.rows[0].id;
};

const getUserByEmail = async (email) => {
	const data = await db.query("SELECT * FROM users WHERE email=$1", [email]);
	return data.rows[0];
};

const getUserStatus = async (id) => {
	const data = await db.query("SELECT login_status FROM users WHERE id=$1", [id]);
	return data.rows[0];
};

const updateLoginStatus = async (id, value) => {
	await db.query("UPDATE users SET login_status=$1 WHERE id=$2", [value, id]);
};

module.exports = {
	getAllClients,
	getClientById,
	createClient,
	updateClient,
	deleteClient,
	createUser,
	getUserByEmail,
	getUserStatus,
	updateLoginStatus,
};
