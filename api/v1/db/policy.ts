import db from "./index";
import type { PolicyInput } from "../../../types";

const getPolicyById = async (id: number): Promise<any[]> => {
  const data = await db.query(
    "SELECT p.*, c.* FROM insurance_policy p JOIN client c ON p.client_id = c.id WHERE p.id = $1",
    [id]
  );
  return data.rows;
};

const getAllPolicies = async (): Promise<any[]> => {
  const data = await db.query(
    "SELECT p.*, c.* FROM insurance_policy p JOIN client c ON p.client_id = c.id"
  );
  return data.rows;
};

const createPolicy = async (reqBody: PolicyInput): Promise<number> => {
  const { client_id, type, coverage_amount, premium, start_date, end_date } = reqBody;
  const data = await db.query(
    "INSERT INTO insurance_policy(client_id, type, coverage_amount, premium, start_date, end_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
    [client_id, type, coverage_amount, premium, start_date, end_date]
  );
  return data.rows[0].id;
};

const updatePolicy = async (
  id: number,
  reqBody: Omit<PolicyInput, "client_id">
): Promise<void> => {
  const { type, coverage_amount, premium, start_date, end_date } = reqBody;
  await db.query(
    "UPDATE insurance_policy SET type=$1, coverage_amount=$2, premium=$3, start_date=$4, end_date=$5 WHERE id=$6",
    [type, coverage_amount, premium, start_date, end_date, id]
  );
};

const deletePolicy = async (id: number): Promise<void> => {
  await db.query("DELETE FROM insurance_claim WHERE insurance_policy_id=$1", [id]);
  await db.query("DELETE FROM insurance_policy WHERE id=$1", [id]);
};

export default { getPolicyById, getAllPolicies, createPolicy, updatePolicy, deletePolicy };
