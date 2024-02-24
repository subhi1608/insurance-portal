const clientController = require("./controllers/clientController.js");
const policyController = require("./controllers/policyController.js");
const policyClaimController = require("./controllers/policyClaimController.js");

const express = require("express");

const v1 = express.Router();

v1.use("/clients", clientController);
v1.use("/policies", policyController);
v1.use("/claims", policyClaimController);

module.exports = v1;
