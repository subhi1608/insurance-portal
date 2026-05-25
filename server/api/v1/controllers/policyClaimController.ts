import express, { Request, Response, NextFunction } from "express";
import policyClaimService from "../Services/policyClaimService";
import { validate, isClaimRecordExist } from "../middlewares/validations";
import { claimSchema } from "../schemas";

const router = express.Router();

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const rawPolicyId = req.query.policy_id;
      let policyId: number | undefined;
      if (rawPolicyId !== undefined) {
        const parsed = Number(rawPolicyId);
        if (!Number.isInteger(parsed) || parsed <= 0) {
          return res.status(400).json({ error: { code: "INVALID_PARAM", message: "policy_id must be a positive integer" } });
        }
        policyId = parsed;
      }
      const { rows, total } = await policyClaimService.getAllClaims(page, limit, policyId);
      return res.status(200).json({ data: rows, meta: { page, limit, total } });
    } catch (error) {
      return next(error);
    }
  })
  .post(validate(claimSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobId = await policyClaimService.enqueueClaimJob(req.body);
      return res.status(202).json({ data: { jobId } });
    } catch (error) {
      return next(error);
    }
  });

router
  .route("/status/:jobId")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobStatus = await policyClaimService.getClaimJobStatus(req.params.jobId as string);
      if (!jobStatus) {
        return res.status(404).json({ error: { code: "JOB_NOT_FOUND", message: "Job not found" } });
      }
      return res.status(200).json({ data: jobStatus });
    } catch (error) {
      return next(error);
    }
  });

router
  .route("/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rows = await policyClaimService.getSingleClaim(Number(req.params.id));
      if (!Array.isArray(rows) || !rows.length) {
        return res
          .status(404)
          .json({ error: { code: "CLAIM_NOT_FOUND", message: "Claim not found" } });
      }
      return res.status(200).json({ data: rows[0] });
    } catch (error) {
      return next(error);
    }
  })
  .put(
    isClaimRecordExist,
    validate(claimSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await policyClaimService.updateClaim(Number(req.params.id), req.body);
        return res.status(200).json({ data: { message: "updated" } });
      } catch (error) {
        return next(error);
      }
    }
  )
  .delete(
    isClaimRecordExist,
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        await policyClaimService.deleteClaim(Number(req.params.id));
        return res.status(200).json({ data: { message: "deleted" } });
      } catch (error) {
        return next(error);
      }
    }
  );

export default router;
