const db = require("../db/index.js");

const getPolicyById = async () => {
	try {
	} catch (error) {
		return error;
	}
};

const getAllPolicies = async () => {
	try {
	} catch (error) {
		return error;
	}
};

const createPolicy = async () => {
	const { pool } = db.createConnection();
	const { client_id, type, coverage_amount, premium, start_date, end_date } =
		reqBody;
	try {
		const _sql = {
			name: "create-policy",
			text: `insert into policy(client_id,type,coverage_amount,premium,start_date,end_date) values ($1,$2,$3,$4,$5,$6) returning *`,
			values: [client_id, type, coverage_amount, premium, start_date, end_date],
		};
		const data = await pool.query(_sql);
		return data.rows[0].id;
	} catch (error) {
		throw error;
	} finally {
	}
};

const updatePolicy = async () => {
	try {
	} catch (error) {
		return error;
	}
};

const deletePolicy = async () => {
	try {
	} catch (error) {
		return error;
	}
};

const policy = {
	getPolicyById,
	getAllPolicies,
	createPolicy,
	updatePolicy,
	deletePolicy,
};

module.exports = policy;
