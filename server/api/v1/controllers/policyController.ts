import express, { Request, Response, NextFunction } from "express";
import policyService from "../Services/policyService";
import { validate, isClientRecordExist, isPolicyExist } from "../middlewares/validations";
import { createPolicySchema, updatePolicySchema } from "../schemas";

const router = express.Router();

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const rawClientId = req.query.client_id;
      let clientId: number | undefined;
      if (rawClientId !== undefined) {
        const parsed = Number(rawClientId);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          return res.status(400).json({ error: { code: "INVALID_PARAM", message: "client_id must be a positive integer" } });
        }
        clientId = parsed;
      }
      const { rows, total } = await policyService.getAllPolicies(page, limit, clientId);
      return res.status(200).json({ data: rows, meta: { page, limit, total } });
    } catch (error) {
      return next(error);
    }
  })
  .post(
    isClientRecordExist,
    validate(createPolicySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const id = await policyService.createPolicy(req.body);
        return res.status(201).json({ data: { id } });
      } catch (error) {
        return next(error);
      }
    }
  );

router
  .route("/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await policyService.getSinglePolicyById(Number(req.params.id));
      if (!Array.isArray(rows) || !rows.length) {
        return res
          .status(404)
          .json({ error: { code: "POLICY_NOT_FOUND", message: "Policy not found" } });
      }
      return res.status(200).json({ data: rows[0] });
    } catch (error) {
      return next(error);
    }
  })
  .put(
    isPolicyExist,
    validate(updatePolicySchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await policyService.updatePolicy(Number(req.params.id), req.body);
        return res.status(200).json({ data: { message: "updated" } });
      } catch (error) {
        return next(error);
      }
    }
  )
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    try {
      await policyService.deletePolicy(Number(req.params.id));
      return res.status(200).json({ data: { message: "deleted" } });
    } catch (error) {
      return next(error);
    }
  });

export default router;
