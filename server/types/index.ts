export interface User {
  id: number;
  email: string;
  password: string;
  login_status: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Client {
  id: number;
  name: string;
  date_of_birth: string;
  address: string;
  contact: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Policy {
  id: number;
  client_id: number;
  type: string;
  coverage_amount: number;
  premium: number;
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Claim {
  id: number;
  insurance_policy_id: number;
  description: string;
  claim_status: string;
  claim_date: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export type ClientInput = Omit<Client, "id" | "created_at" | "updated_at" | "deleted_at">;
export type PolicyInput = Omit<Policy, "id" | "created_at" | "updated_at" | "deleted_at">;
export type ClaimInput = Omit<Claim, "id" | "created_at" | "updated_at" | "deleted_at">;

export type ClaimJobData = ClaimInput;
export interface ClaimJobResult {
  claimId: number;
}

export interface PaginationResult<T> {
  rows: T[];
  total: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type ApiResponse<T> =
  | { data: T }
  | { error: { code: string; message: string; details?: string[] } };
