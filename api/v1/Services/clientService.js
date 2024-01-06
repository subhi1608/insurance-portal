const client = require("../db/client.js");

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

const clientService = {
	getClients,
	getClientById,
	createClient,
	updateClient,
	deleteClient,
};
module.exports = clientService;
