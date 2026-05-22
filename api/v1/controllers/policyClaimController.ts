import express, { Request, Response, NextFunction } from "express";
import policyClaimService from "../Services/policyClaimService";
import { validate, isClaimRecordExist } from "../middlewares/validations";
import { claimSchema } from "../schemas";

const router = express.Router();

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await policyClaimService.getAllClaims();
      return res.status(200).json({ data });
    } catch (error) {
      return next(error);
    }
  })
  .post(validate(claimSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = await policyClaimService.createNewClaim(req.body);
      return res.status(201).json({ data: { id } });
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
