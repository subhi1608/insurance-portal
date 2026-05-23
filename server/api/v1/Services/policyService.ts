import policy from "../db/policy";
import type { PolicyInput } from "../../../types";

const createPolicy = async (data: PolicyInput) => {
  try {
    return await policy.createPolicy(data);
  } catch (error) {
    return error;
  }
};

const getAllPolicies = async (page: number, limit: number, clientId?: number) => {
  return await policy.getAllPolicies(page, limit, clientId);
};

const getSinglePolicyById = async (id: number) => {
  try {
    return await policy.getPolicyById(id);
  } catch (error) {
    return error;
  }
};

const updatePolicy = async (id: number, data: Omit<PolicyInput, "client_id">) => {
  try {
    return await policy.updatePolicy(id, data);
  } catch (error) {
    return error;
  }
};

const deletePolicy = async (id: number) => {
  try {
    return await policy.deletePolicy(id);
  } catch (error) {
    return error;
  }
};

const policyService = {
  createPolicy,
  getAllPolicies,
  getSinglePolicyById,
  updatePolicy,
  deletePolicy,
};

export default policyService;
