"use strict";

const express = require("express");
const router = express.Router();
const PolicyClaimService = require("../Services/policyClaimService");
const { validate, isClaimRecordExist } = require("../middlewares/validations");
const { claimSchema } = require("../schemas");

router
	.route("/")
	.get(async (req, res, next) => {
		try {
			const data = await PolicyClaimService.getAllClaims();
			return res.status(200).json({ data });
		} catch (error) {
			return next(error);
		}
	})
	.post(validate(claimSchema), async (req, res, next) => {
		try {
			const id = await PolicyClaimService.createNewClaim(req.body);
			return res.status(201).json({ data: { id } });
		} catch (error) {
			return next(error);
		}
	});

router
	.route("/:id")
	.get(async (req, res, next) => {
		try {
			const rows = await PolicyClaimService.getSingleClaim(req.params.id);
			if (!rows || !rows.length) {
				return res.status(404).json({ error: { code: "CLAIM_NOT_FOUND", message: "Claim not found" } });
			}
			return res.status(200).json({ data: rows[0] });
		} catch (error) {
			return next(error);
		}
	})
	.put(isClaimRecordExist, validate(claimSchema), async (req, res, next) => {
		try {
			await PolicyClaimService.updateClaim(req.params.id, req.body);
			return res.status(200).json({ data: { message: "updated" } });
		} catch (error) {
			return next(error);
		}
	})
	.delete(isClaimRecordExist, async (req, res, next) => {
		try {
			await PolicyClaimService.deleteClaim(req.params.id);
			return res.status(200).json({ data: { message: "deleted" } });
		} catch (error) {
			return next(error);
		}
	});

module.exports = router;
