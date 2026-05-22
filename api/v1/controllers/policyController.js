"use strict";

const express = require("express");
const router = express.Router();
const policyService = require("../Services/policyService");
const { validate, isClientRecordExist, isPolicyExist } = require("../middlewares/validations");
const { createPolicySchema, updatePolicySchema } = require("../schemas");

router
	.route("/")
	.get(async (req, res, next) => {
		try {
			const data = await policyService.getAllPolicies();
			return res.status(200).json({ data });
		} catch (error) {
			return next(error);
		}
	})
	.post(isClientRecordExist, validate(createPolicySchema), async (req, res, next) => {
		try {
			const id = await policyService.createPolicy(req.body);
			return res.status(201).json({ data: { id } });
		} catch (error) {
			return next(error);
		}
	});

router
	.route("/:id")
	.get(async (req, res, next) => {
		try {
			const rows = await policyService.getSinglePolicyById(req.params.id);
			if (!rows || !rows.length) {
				return res.status(404).json({ error: { code: "POLICY_NOT_FOUND", message: "Policy not found" } });
			}
			return res.status(200).json({ data: rows[0] });
		} catch (error) {
			return next(error);
		}
	})
	.put(isPolicyExist, validate(updatePolicySchema), async (req, res, next) => {
		try {
			await policyService.updatePolicy(req.params.id, req.body);
			return res.status(200).json({ data: { message: "updated" } });
		} catch (error) {
			return next(error);
		}
	})
	.delete(async (req, res, next) => {
		try {
			await policyService.deletePolicy(req.params.id);
			return res.status(200).json({ data: { message: "deleted" } });
		} catch (error) {
			return next(error);
		}
	});

module.exports = router;
