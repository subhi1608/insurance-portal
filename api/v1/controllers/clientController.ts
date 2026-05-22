import express, { Request, Response, NextFunction } from "express";
import clientService from "../Services/clientService";
import { validate, isClientRecordExist } from "../middlewares/validations";
import { clientSchema } from "../schemas";

const router = express.Router();

router
  .route("/")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const { rows, total } = await clientService.getClients(page, limit);
      return res.status(200).json({ data: rows, meta: { page, limit, total } });
    } catch (error) {
      return next(error);
    }
  })
  .post(validate(clientSchema), async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = await clientService.createClient(req.body);
      return res.status(201).json({ data: { id } });
    } catch (error) {
      return next(error);
    }
  });

router
  .route("/:id")
  .get(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = Number(req.params.id);
      const rows = await clientService.getClientById(clientId);
      if (!rows || !Array.isArray(rows) || !rows.length) {
        return res
          .status(404)
          .json({ error: { code: "CLIENT_NOT_FOUND", message: "Client not found" } });
      }
      return res.status(200).json({ data: rows[0] });
    } catch (error) {
      return next(error);
    }
  })
  .put(
    isClientRecordExist,
    validate(clientSchema),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const clientId = Number(req.params.id);
        await clientService.updateClient(clientId, req.body);
        return res.status(200).json({ data: { message: "updated" } });
      } catch (error) {
        return next(error);
      }
    }
  )
  .delete(async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = Number(req.params.id);
      await clientService.deleteClient(clientId);
      return res.status(200).json({ data: { message: "deleted" } });
    } catch (error) {
      return next(error);
    }
  });

export default router;
