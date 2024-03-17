const clientController = require("./controllers/clientController.js");
const policyController = require("./controllers/policyController.js");
const policyClaimController = require("./controllers/policyClaimController.js");
const authController = require("./controllers/authController.js");
const utils = require("./utils.js");

const express = require("express");

const v1 = express.Router();

v1.use("/clients", utils.isAuthenticated, utils.isUserLogged, clientController);
v1.use(
	"/policies",
	utils.isAuthenticated,
	utils.isUserLogged,
	policyController
);
v1.use(
	"/claims",
	utils.isAuthenticated,
	utils.isUserLogged,
	policyClaimController
);
v1.use("/auth", authController);

module.exports = v1;
