import policy from "../db/policy";
import * as cache from "../cache/redisCache";
import type { PolicyInput } from "../../../types";

const createPolicy = async (data: PolicyInput) => {
  try {
    const result = await policy.createPolicy(data);
    await cache.invalidate("policies:*");
    return result;
  } catch (error) {
    return error;
  }
};

const getAllPolicies = async (page: number, limit: number, clientId?: number) => {
  const key = `policies:page:${page}:limit:${limit}:clientId:${clientId ?? "none"}`;
  const cached = await cache.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  const result = await policy.getAllPolicies(page, limit, clientId);
  await cache.set(key, JSON.stringify(result), 60);
  return result;
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
    const result = await policy.updatePolicy(id, data);
    await cache.invalidate("policies:*");
    return result;
  } catch (error) {
    return error;
  }
};

const deletePolicy = async (id: number) => {
  try {
    const result = await policy.deletePolicy(id);
    await cache.invalidate("policies:*");
    return result;
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
