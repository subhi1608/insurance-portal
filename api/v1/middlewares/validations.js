const client = require("../db/client");

const isClientRecordExist = async (req, res, next) => {
	try {
		const clientData = await client.getClientById(req.body.clientId);
		console.log(clientData, "data");
		if (!clientData.length) return next();
		else return res.json({ message: "Policy already exists!!" });
	} catch (error) {
		return error;
	}
};

const validations = {
	isClientRecordExist,
};

module.exports = validations;
