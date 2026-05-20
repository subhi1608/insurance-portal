const bcrypt = require("bcrypt");
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

const _signTokens = (userId) => {
	const accessToken = jwt.sign({ id: userId }, process.env.TOKEN, { expiresIn: "15m" });
	const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
	return { accessToken, refreshToken };
};

const createUser = async (data) => {
	try {
		const { email, password } = data;
		const hashedPassword = await bcrypt.hash(password, 12);
		const userId = await client.createUser({ email, password: hashedPassword });
		const tokens = _signTokens(userId);
		await client.updateLoginStatus(userId, true);
		return tokens;
	} catch (error) {
		return error;
	}
};

const loginUser = async (email, password) => {
	try {
		const user = await client.getUserByEmail(email);
		if (!user) return null;
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) return null;
		const tokens = _signTokens(user.id);
		await client.updateLoginStatus(user.id, true);
		return tokens;
	} catch (error) {
		return error;
	}
};

const refreshAccessToken = async (refreshToken) => {
	try {
		const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
		const accessToken = jwt.sign({ id: decoded.id }, process.env.TOKEN, { expiresIn: "15m" });
		return { accessToken };
	} catch (error) {
		return null;
	}
};

const logoutUser = async (id) => {
	try {
		await client.updateLoginStatus(id, false);
		return { message: "Logged out successfully" };
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
	refreshAccessToken,
	logoutUser,
};
module.exports = clientService;
