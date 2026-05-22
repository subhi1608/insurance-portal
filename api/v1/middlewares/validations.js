const client = require("../db/client");
const policyClaim = require("../db/policyclaim");
const policy = require("../db/policy");


const validate = (schema) => (req, res, next) => {
	const result = schema.safeParse(req.body);
	if (!result.success) {
		const details = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
		return res.status(400).json({
			error: { code: "VALIDATION_ERROR", message: "Invalid request body", details },
		});
	}
	req.body = result.data;
	return next();
};

const isClientRecordExist = async (req, res, next) => {
	try {
		const client_id = req.params.id || req.body.client_id;
		const clientData = client_id ? await client.getClientById(client_id) : [];
		if (clientData && clientData.length) return next();
		return res.status(404).json({ error: { code: "CLIENT_NOT_FOUND", message: "Client record not found" } });
	} catch (error) {
		return next(error);
	}
};

const isClaimRecordExist = async (req, res, next) => {
	try {
		const claimData = await policyClaim.getSingleClaim(req.params.id);
		if (claimData.length) return next();
		return res.status(404).json({ error: { code: "CLAIM_NOT_FOUND", message: "Claim record not found" } });
	} catch (error) {
		return next(error);
	}
};

const isPolicyExist = async (req, res, next) => {
	try {
		const policyData = await policy.getPolicyById(req.params.id);
		if (policyData.length) return next();
		return res.status(404).json({ error: { code: "POLICY_NOT_FOUND", message: "Policy record not found" } });
	} catch (error) {
		return next(error);
	}
};

module.exports = { validate, isClientRecordExist, isClaimRecordExist, isPolicyExist };