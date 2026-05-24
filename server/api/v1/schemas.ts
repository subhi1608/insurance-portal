import { z } from "zod";

export const authSigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export const clientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  address: z.string().min(1, "Address is required"),
  contact: z.string().min(10, "Contact is required"),
});

const _policyBase = z.object({
  type: z.string().min(1, "Policy type is required"),
  coverage_amount: z.coerce.number().positive("Coverage amount must be positive"),
  premium: z.coerce.number().positive("Premium must be positive"),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
});

export const createPolicySchema = _policyBase.extend({
  client_id: z.coerce.number().int().positive("client_id must be a positive integer"),
});

export const updatePolicySchema = _policyBase;

export const claimSchema = z.object({
  insurance_policy_id: z.coerce
    .number()
    .int()
    .positive("insurance_policy_id must be a positive integer"),
  description: z.string().min(1, "Description is required"),
  claim_status: z.string().min(1, "Claim status is required"),
  claim_date: z.string().min(1, "Claim date is required"),
});
