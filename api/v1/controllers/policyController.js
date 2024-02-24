"use strict";

const express = require("express");
const router = express.Router();
const policyService = require("../Services/policyService");
const validations = require("../middlewares/validations");

router
	.route("/")
	.get(async (req, res) => {
		try {
			const getAllPolicies = await policyService.getAllPolicies();
			return res.status(200).json(getAllPolicies);
		} catch (error) {
			return res.status(400).json(error);
		}
	})
	.post(validations.isClientRecordExist, async (req, res) => {
		try {
			const reqBody = req.body;
			const clientData = await policyService.createPolicy(reqBody);
			return res.status(200).json(clientData);
		} catch (error) {}
	});

router
	.route("/:id")
	.get(async (req, res) => {
		try {
			const getSinglePolicy = await policyService.getSinglePolicyById(
				req.params.id
			);
			return res.status(200).json(getSinglePolicy);
		} catch (error) {
			return res.status(400).json(error);
		}
	})
	.put(async (req, res) => {
		try {
			const updatePolicyData = Object.assign({}, req.body);
			const updatePolicy = await policyService.updatePolicy(
				req.params.id,
				updatePolicyData
			);
			return res.status(200).json(updatePolicy);
		} catch (error) {
			return res.status(400).json(error);
		}
	})
	.delete(async (req, res) => {
		try {
			const deletePolicy = await policyService.deletePolicy(req.params.id);
			return res.status(200).json(deletePolicy);
		} catch (error) {
			return res.status(400).json(error);
		}
	});

module.exports = router;
