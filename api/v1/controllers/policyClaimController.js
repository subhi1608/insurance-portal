const express = require("express");
const router = express.Router();
const PolicyClaimService = require("../Services/policyClaimService");
const validations = require("../middlewares/validations");

router
	.route("/")
	.get(async (req, res, next) => {
		try {
			const data = await PolicyClaimService.getAllClaims();
			return res.status(200).json(data);
		} catch (error) {
			return res.status(400).json(error);
		}
	})
	.post(validations.reqBodyValidations, async (req, res, next) => {
		try {
			const reqBody = Object.assign({}, req.body);
			const data = await PolicyClaimService.createNewClaim(reqBody);
			return res.status(200).json({ message: "Created", data: data });
		} catch (error) {
			console.log(error, "error controller");
			return res.status(400).json({ message: "something went wrong" });
		}
	});

router
	.route("/:id")
	.get(async (req, res, next) => {
		try {
			const data = await PolicyClaimService.getSingleClaim(req.params.id);
			return res.status(200).json(data);
		} catch (error) {
			return res.status(400).json(error);
		}
	})
	.put(validations.isClaimRecordExist, async (req, res, next) => {
		try {
			const reqBody = Object.assign({}, req.body);
			const data = await PolicyClaimService.updateClaim(req.params.id, reqBody);
			return res.status(200).json({ data: data });
		} catch (error) {
			return res.status(400).json({ message: "something went wrong" });
		}
	})
	.delete(validations.isClaimRecordExist, async (req, res, next) => {
		try {
			const data = await PolicyClaimService.deleteClaim(req.params.id);
			return res.status(200).json({ data: data });
		} catch (error) {
			return res.status(400).json({ message: "something went wrong" });
		}
	});

module.exports = router;
