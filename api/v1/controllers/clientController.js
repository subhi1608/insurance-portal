"use strict";

const express = require("express");
const router = express.Router();
const clientService = require("../Services/clientService.js");
const { validate, isClientRecordExist } = require("../middlewares/validations.js");
const { clientSchema } = require("../schemas.js");

router
	.route("/")
	.get(async (req, res, next) => {
		try {
			const data = await clientService.getClients();
			return res.status(200).json({ data });
		} catch (error) {
			return next(error);
		}
	})
	.post(validate(clientSchema), async (req, res, next) => {
		try {
			const id = await clientService.createClient(req.body);
			return res.status(201).json({ data: { id } });
		} catch (error) {
			return next(error);
		}
	});

router
	.route("/:id")
	.get(async (req, res, next) => {
		try {
			const clientId = parseInt(req.params.id);
			const rows = await clientService.getClientById(clientId);
			if (!rows || !rows.length) {
				return res.status(404).json({ error: { code: "CLIENT_NOT_FOUND", message: "Client not found" } });
			}
			return res.status(200).json({ data: rows[0] });
		} catch (error) {
			return next(error);
		}
	})
	.put(isClientRecordExist, validate(clientSchema), async (req, res, next) => {
		try {
			const clientId = parseInt(req.params.id);
			await clientService.updateClient(clientId, req.body);
			return res.status(200).json({ data: { message: "updated" } });
		} catch (error) {
			return next(error);
		}
	})
	.delete(async (req, res, next) => {
		try {
			const clientId = parseInt(req.params.id);
			await clientService.deleteClient(clientId);
			return res.status(200).json({ data: { message: "deleted" } });
		} catch (error) {
			return next(error);
		}
	});

module.exports = router;
