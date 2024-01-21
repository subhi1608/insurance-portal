const client = require("../db/client");

const isClientRecordExist = async (req, res, next) => {
	try {
		const clientData = await client.getClientById(req.body.clientId);
		if (clientData && clientData.length) next();
		return res.json({ message: "No record found" });
	} catch (error) {}
};

const validations = {
	isClientRecordExist,
};

module.exports = validations;
