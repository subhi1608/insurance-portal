import policyClaim from "../db/policyclaim";
import type { ClaimInput } from "../../../types";

const getAllClaims = async () => {
  try {
    return await policyClaim.getAllClaims();
  } catch (error) {
    return error;
  }
};

const getSingleClaim = async (id: number) => {
  try {
    return await policyClaim.getSingleClaim(id);
  } catch (error) {
    return error;
  }
};

const createNewClaim = async (reqBody: ClaimInput) => {
  return await policyClaim.createNewClaim(reqBody);
};

const updateClaim = async (id: number, reqBody: ClaimInput) => {
  return await policyClaim.updateClaim(id, reqBody);
};

const deleteClaim = async (id: number) => {
  return await policyClaim.deleteClaim(id);
};

const policyClaimService = {
  getAllClaims,
  getSingleClaim,
  createNewClaim,
  updateClaim,
  deleteClaim,
};

export default policyClaimService;
