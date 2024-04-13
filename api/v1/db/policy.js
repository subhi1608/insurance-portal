const db = require("../db/index.js");

const getPolicyById = async (id) => {
	const { query } = await db.createConnection();
	try {
		const _sql = {
			name: "get-client-by-id",
			text: "select p.*,c.* from insurance_policy p join client as c on p.client_id = c.id where p.id= $1",
			values: [id],
		};
		const data = await query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	}
};

const getAllPolicies = async () => {
	const { query } = await db.createConnection();
	try {
		const _sql = `select p.*,c.* from insurance_policy p join client as c on p.client_id = c.id`;
		const data = await query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	}
};

const createPolicy = async (reqBody) => {
	const { query } = await db.createConnection();
	try {
		const { client_id, type, coverage_amount, premium, start_date, end_date } =
			reqBody;
		const _sql = {
			name: "create-policy",
			text: `insert into insurance_policy(client_id,type,coverage_amount,premium,start_date,end_date) values ($1,$2,$3,$4,$5,$6) returning *`,
			values: [client_id, type, coverage_amount, premium, start_date, end_date],
		};
		const data = await query(_sql);
		return data.rows[0].id;
	} catch (error) {
		console.log(error, "db error");
		throw error;
	}
};

const updatePolicy = async (id, data) => {
	const { query } = await db.createConnection();
	try {
		const { type, coverage_amount, premium, start_date, end_date } = data;
		const _sql = {
			name: "update-policy",
			text: `update insurance_policy set type=$1,coverage_amount=$2,premium=$3,start_date=$4,
			end_date=$5  where id=$6`,
			values: [type, coverage_amount, premium, start_date, end_date, id],
		};
		await query(_sql);
		return "updated";
	} catch (error) {
		console.log(error, "err");
		throw error;
	}
};

const deletePolicy = async (id) => {
	const { query } = await db.createConnection();
	try {
		let _sql = {
			name: "delete-claim",
			text: `delete from insurance_claim where insurance_policy_id = $1`,
			values: [id],
		};

		await query(_sql);

		_sql = {
			name: "delete-policy",
			text: `delete from insurance_policy where id = $1`,
			values: [id],
		};
		await query(_sql);
		return "deleted";
	} catch (error) {
		throw error;
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
