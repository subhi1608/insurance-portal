const client = require("../db/client.js");
const jwt = require("jsonwebtoken");

const getClients = async () => {
	try {
		const data = await client.getAllClients();
		return data;
	} catch (error) {}
};

const getClientById = async (clientId) => {
	try {
		const data = await client.getClientById(clientId);
		return data;
	} catch (error) {
		return error;
	}
};

const createClient = async (data) => {
	try {
		const clientData = await client.createClient(data);
		return clientData;
	} catch (error) {
		return error;
	}
};

const updateClient = async (id, data) => {
	try {
		const clientData = await client.updateClient(id, data);
		return clientData;
	} catch (error) {
		return error;
	}
};

const deleteClient = async (id) => {
	try {
		const clientData = await client.deleteClient(id);
		return clientData;
	} catch (error) {
		return error;
	}
};

const createUser = async (data) => {
	try {
		const userData = await client.createUser(data);
		const token = jwt.sign({ id: userData }, process.env.TOKEN, {
			expiresIn: "1d",
		});
		await client.updateLoginStatus(userData, true);
		return { token };
	} catch (error) {
		return error;
	}
};

const loginUser = async (id) => {
	try {
		const token = jwt.sign({ id: id }, process.env.TOKEN, {
			expiresIn: "1d",
		});
		await client.updateLoginStatus(id, true);
		return { token };
	} catch (error) {
		return error;
	}
};

const logoutUser = async (id) => {
	try {
		await client.updateLoginStatus(id, false);
		return { token };
	} catch (error) {
		return error;
	}
};

const clientService = {
	getClients,
	getClientById,
	createClient,
	updateClient,
	deleteClient,
	createUser,
	loginUser,
	logoutUser,
};
module.exports = clientService;
