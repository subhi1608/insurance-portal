const policyClaim = require("../db/policyclaim.js");

const getAllClaims = async () => {
	try {
		const data = await policyClaim.getAllClaims();
		return data;
	} catch (error) {
		return error;
	}
};

const getSingleClaim = async (id) => {
	try {
		const data = await policyClaim.getSingleClaim(id);
		return data;
	} catch (error) {
		return error;
	}
};

const createNewClaim = async (reqBody) => {
	try {
		const data = await policyClaim.createNewClaim(reqBody);
		return data;
	} catch (error) {
		throw error;
	}
};

const updateClaim = async (id, reqBody) => {
	try {
		const data = await policyClaim.updateClaim(id, reqBody);
		return data;
	} catch (error) {
		throw error;
	}
};

const deleteClaim = async (id) => {
	try {
		const data = await policyClaim.deleteClaim(id);
		return data;
	} catch (error) {
		throw error;
	}
};

const policyClaimService = {
	getAllClaims,
	getSingleClaim,
	createNewClaim,
	updateClaim,
	deleteClaim,
};

module.exports = policyClaimService;
