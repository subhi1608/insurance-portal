import db from "./index";
import type { Client, ClientInput, PaginationResult, User } from "../../../types";

const getAllClients = async (page: number, limit: number): Promise<PaginationResult<Client>> => {
  const offset = (page - 1) * limit;
  const [countResult, dataResult] = await Promise.all([
    db.query("SELECT COUNT(*) FROM client"),
    db.query("SELECT * FROM client ORDER BY id LIMIT $1 OFFSET $2", [limit, offset]),
  ]);
  return { rows: dataResult.rows, total: Number(countResult.rows[0].count) };
};

const getClientById = async (clientId: number): Promise<Client[]> => {
  const data = await db.query("SELECT * FROM client WHERE id = $1", [clientId]);
  return data.rows;
};

const createClient = async (reqBody: ClientInput): Promise<number> => {
  const { name, date_of_birth, address, contact } = reqBody;
  const data = await db.query(
    "INSERT INTO client(name, date_of_birth, address, contact) VALUES ($1, $2, $3, $4) RETURNING id",
    [name, date_of_birth, address, contact]
  );
  return data.rows[0].id;
};

const updateClient = async (id: number, reqBody: ClientInput): Promise<void> => {
  const { name, date_of_birth, address, contact } = reqBody;
  await db.query(
    "UPDATE client SET name=$1, date_of_birth=$2, address=$3, contact=$4 WHERE id=$5",
    [name, date_of_birth, address, contact, id]
  );
};

const deleteClient = async (clientId: number): Promise<void> => {
  const policyRows = await db.query("SELECT id FROM insurance_policy WHERE client_id=$1", [
    clientId,
  ]);
  const policyIds = policyRows.rows.map((r: { id: number }) => r.id);

  if (policyIds.length) {
    await db.query("DELETE FROM insurance_claim WHERE insurance_policy_id = ANY($1::int[])", [
      policyIds,
    ]);
  }

  await db.query("DELETE FROM insurance_policy WHERE client_id=$1", [clientId]);
  await db.query("DELETE FROM client WHERE id=$1", [clientId]);
};

const createUser = async (reqBody: { email: string; password: string }): Promise<number> => {
  const { email, password } = reqBody;
  await db.query("DELETE FROM users WHERE email=$1", [email]);
  const data = await db.query(
    "INSERT INTO users(email, password) VALUES ($1, $2) RETURNING id",
    [email, password]
  );
  return data.rows[0].id;
};

const getUserByEmail = async (email: string): Promise<User | undefined> => {
  const data = await db.query("SELECT * FROM users WHERE email=$1", [email]);
  return data.rows[0];
};

const getUserStatus = async (
  id: number | undefined
): Promise<{ login_status: boolean } | undefined> => {
  const data = await db.query("SELECT login_status FROM users WHERE id=$1", [id]);
  return data.rows[0];
};

const updateLoginStatus = async (id: number, value: boolean): Promise<void> => {
  await db.query("UPDATE users SET login_status=$1 WHERE id=$2", [value, id]);
};

export default {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  createUser,
  getUserByEmail,
  getUserStatus,
  updateLoginStatus,
};
