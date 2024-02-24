const client = require("../db/client");
const policyClaim = require("../db/policyclaim");
const isClientRecordExist = async (req, res, next) => {
	try {
		const clientData = await client.getClientById(req.body.clientId);
		if (!clientData.length) return next();
		else return res.json({ message: "Policy already exists!!" });
	} catch (error) {
		return error;
	}
};

const reqBodyValidations = async (req, res, next) => {
	try {
		let errorMsg = "";
		const keys = {
			insurance_policy_id: "string",
			description: "string",
			claim_status: "string",
			claim_date: "string",
		};
		const reqBody = req.body;
		Object.keys(reqBody)?.forEach((item) => {
			if (
				Object.keys(keys).includes(item) &&
				typeof reqBody[item] === keys[item]
			) {
				if (!reqBody[item]) errorMsg = `${item} missing`;
			} else errorMsg = "invalid payload";
		});
		if (!errorMsg) return next();
		return res.json({ message: errorMsg });
	} catch (error) {
		return error;
	}
};

const isClaimRecordExist = async (req, res, next) => {
	try {
		const claimData = await policyClaim.getSingleClaim(req.params.id);
		if (claimData.length) return next();
		else return res.json({ message: "record not found!!" });
	} catch (error) {
		return error;
	}
};

const validations = {
	isClientRecordExist,
	reqBodyValidations,
	isClaimRecordExist,
};

module.exports = validations;
