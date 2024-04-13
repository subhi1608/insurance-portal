const client = require("../db/client");
const policyClaim = require("../db/policyclaim");
const CONSTANTS = require("../constants");
const policy = require("../db/policy");
const isClientRecordExist = async (req, res, next) => {
	try {
		const client_id = req.params.id || req.body.client_id;
		let clientData = "";
		if (client_id) clientData = await client.getClientById(client_id);
		if (clientData && clientData.length) return next();
		else return res.json({ message: "Client record not found!!" });
	} catch (error) {
		return error;
	}
};

const reqBodyValidations = async (req, res, next, _key) => {
	try {
		let errorMsg = "";
		const keys = CONSTANTS[_key];
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

const isPolicyExist = async (req, res, next) => {
	try {
		const claimData = await policy.getPolicyById(req.params.id);
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
	isPolicyExist,
};

module.exports = validations;
