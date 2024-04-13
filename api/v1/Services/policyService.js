const policy = require("../db/policy.js");

const createPolicy = async (data) => {
	try {
		const policyData = await policy.createPolicy(data);
		return policyData;
	} catch (error) {
		return error;
	}
};

const getAllPolicies = async () => {
	try {
		const getAllPolicies = await policy.getAllPolicies();
		return getAllPolicies;
	} catch (error) {
		return error;
	}
};

const getSinglePolicyById = async (id) => {
	try {
		const getSinglePolicyById = await policy.getPolicyById(id);
		return getSinglePolicyById;
	} catch (error) {
		return error;
	}
};

const updatePolicy = async (id, data) => {
	try {
		const policyUpdateData = await policy.updatePolicy(id, data);
		return policyUpdateData;
	} catch (error) {
		return error;
	}
};

const deletePolicy = async (id) => {
	try {
		const policyData = await policy.deletePolicy(id);
		return policyData;
	} catch (error) {
		return error;
	}
};

const policyService = {
	createPolicy,
	getAllPolicies,
	getSinglePolicyById,
	updatePolicy,
	deletePolicy,
};

module.exports = policyService;
