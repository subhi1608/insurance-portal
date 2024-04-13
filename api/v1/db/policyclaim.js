const db = require("../db/index.js");

const getAllClaims = async () => {
	const { query } = await db.createConnection();
	try {
		const _sql = `select ic.*,c.*,ip.* from insurance_claim ic join insurance_policy as ip on ic.insurance_policy_id = ip.id join client as c on ip.client_id=c.id;`;
		const data = await query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	}
};

const getSingleClaim = async (id) => {
	const { query } = await db.createConnection();
	try {
		const _sql = {
			name: "get-claim-by-id",
			text: "select ic.*,c.*,ip.* from insurance_claim ic join insurance_policy as ip on ic.insurance_policy_id = ip.id join client as c on ip.client_id=c.id where ic.id= $1",
			values: [id],
		};
		const data = await query(_sql);
		return data.rows;
	} catch (error) {
		throw error;
	}
};

const createNewClaim = async (reqBody) => {
	const { query } = await db.createConnection();
	try {
		const { insurance_policy_id, description, claim_status, claim_date } =
			reqBody;
		const _sql = {
			name: "create-policy",
			text: `insert into insurance_claim(insurance_policy_id,description,claim_status,claim_date) values ($1,$2,$3,$4) returning *`,
			values: [insurance_policy_id, description, claim_status, claim_date],
		};
		const data = await query(_sql);
		return data.rows[0].id;
	} catch (error) {
		throw error;
	}
};

const updateClaim = async (id, data) => {
	const { query } = await db.createConnection();
	const { insurance_policy_id, description, claim_status, claim_date } = data;
	try {
		const _sql = {
			name: "update-policy",
			text: `update insurance_claim set insurance_policy_id=$1, description=$2, claim_status=$3, claim_date=$4  where id=$5`,
			values: [insurance_policy_id, description, claim_status, claim_date, id],
		};
		await query(_sql);
		return "updated";
	} catch (error) {
		throw error;
	}
};

const deleteClaim = async (id) => {
	const { query } = await db.createConnection();
	try {
		const _sql = {
			name: "delete-policy-claim",
			text: `delete from insurance_claim where id = $1`,
			values: [id],
		};
		await query(_sql);
		return "deleted";
	} catch (error) {
		throw error;
	}
};

const policyClaim = {
	getAllClaims,
	getSingleClaim,
	createNewClaim,
	updateClaim,
	deleteClaim,
};

module.exports = policyClaim;
