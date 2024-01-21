const policy = require("../db/policy.js");

const createPolicy = async (data) => {
	try {
		const policyData = await policy.createPolicy(data);
		return policyData;
	} catch (error) {
		return error;
	}
};

const policyService = {
	createPolicy,
};

module.exports = policyService;
