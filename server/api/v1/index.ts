import express from "express";
import clientController from "./controllers/clientController";
import policyController from "./controllers/policyController";
import policyClaimController from "./controllers/policyClaimController";
import authController from "./controllers/authController";
import utils from "./utils";

const v1 = express.Router();

v1.use("/clients", utils.isAuthenticated, utils.isUserLogged, clientController);
v1.use("/policies", utils.isAuthenticated, utils.isUserLogged, policyController);
v1.use("/claims", utils.isAuthenticated, utils.isUserLogged, policyClaimController);
v1.use("/auth", authController);

export default v1;
