import db from "./index";
import type { ClaimInput } from "../../../types";

const getAllClaims = async (): Promise<any[]> => {
  const data = await db.query(
    `SELECT ic.*, c.*, ip.*
     FROM insurance_claim ic
     JOIN insurance_policy ip ON ic.insurance_policy_id = ip.id
     JOIN client c ON ip.client_id = c.id`
  );
  return data.rows;
};

const getSingleClaim = async (id: number): Promise<any[]> => {
  const data = await db.query(
    `SELECT ic.*, c.*, ip.*
     FROM insurance_claim ic
     JOIN insurance_policy ip ON ic.insurance_policy_id = ip.id
     JOIN client c ON ip.client_id = c.id
     WHERE ic.id = $1`,
    [id]
  );
  return data.rows;
};

const createNewClaim = async (reqBody: ClaimInput): Promise<number> => {
  const { insurance_policy_id, description, claim_status, claim_date } = reqBody;
  const data = await db.query(
    "INSERT INTO insurance_claim(insurance_policy_id, description, claim_status, claim_date) VALUES ($1, $2, $3, $4) RETURNING id",
    [insurance_policy_id, description, claim_status, claim_date]
  );
  return data.rows[0].id;
};

const updateClaim = async (id: number, reqBody: ClaimInput): Promise<void> => {
  const { insurance_policy_id, description, claim_status, claim_date } = reqBody;
  await db.query(
    "UPDATE insurance_claim SET insurance_policy_id=$1, description=$2, claim_status=$3, claim_date=$4 WHERE id=$5",
    [insurance_policy_id, description, claim_status, claim_date, id]
  );
};

const deleteClaim = async (id: number): Promise<void> => {
  await db.query("DELETE FROM insurance_claim WHERE id=$1", [id]);
};

export default { getAllClaims, getSingleClaim, createNewClaim, updateClaim, deleteClaim };
