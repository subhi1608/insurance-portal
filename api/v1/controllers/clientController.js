"use strict";

const express = require("express");
const router = express.Router();
const clientService = require("../Services/clientService.js");
router
	.route("/")
	.get(async (req, res) => {
		try {
			const data = await clientService.getClients();
			console.log(data, "data");
			return res.status(200).json(data);
		} catch (error) {
			return res.json(error);
		}
	})
	.post(async (req, res) => {
		try {
			console.log(req.body, "body");
			const data = await clientService.createClient(req.body);
			return res.status(200).json(data);
		} catch (error) {
			return res.json(error);
		}
	});

router
	.route("/:id")
	.get(async (req, res) => {
		try {
			const clientId = parseInt(req.params.id);
			const data = await clientService.getClientById(clientId);
			return res.status(200).json(data);
		} catch (error) {
			return res.json(error);
		}
	})
	.put(async (req, res) => {
		try {
			const clientId = parseInt(req.params.id);
			const clientBody = req.body;
			const data = await clientService.updateClient(clientId, clientBody);
			return res.status(200).json(data);
		} catch (error) {
			return res.json(error);
		}
	})
	.delete(async (req, res) => {
		try {
			const clientId = parseInt(req.params.id);
			const data = await clientService.deleteClient(clientId);
			return res.status(200).json(data);
		} catch (error) {
			return res.json(error);
		}
	});

module.exports = router;
