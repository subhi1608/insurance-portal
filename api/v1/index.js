const clientController = require("./controllers/clientController.js");
const policyController = require("./controllers/policyController.js");

const express = require("express");

const v1 = express.Router();

v1.use("/clients", clientController);
v1.use("/policies", policyController);
v1.use("/claims", clientController);

module.exports = v1;
