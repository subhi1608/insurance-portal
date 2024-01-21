"use strict";

const express = require("express");
const router = express.Router();
const policyService = require("../Services/policyService");
const validations = require("../middlewares/validations");

router
	.route("/")
	.get(async (req, res) => {
		try {
		} catch (error) {}
	})
	.post(validations.isClientRecordExist, async (req, res) => {
		try {
			const reqBody = req.body;
			const clientData = await policyService.createPolicy(reqBody);
		} catch (error) {}
	});

router
	.route("/:id")
	.get(async (req, res) => {
		try {
		} catch (error) {}
	})
	.put(async (req, res) => {
		try {
		} catch (error) {}
	})
	.delete(async (req, res) => {
		try {
		} catch (error) {}
	});

module.exports = router;
