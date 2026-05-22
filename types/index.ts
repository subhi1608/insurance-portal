export interface User {
  id: number;
  email: string;
  password: string;
  login_status: boolean;
  created_at?: string;
}

export interface Client {
  id: number;
  name: string;
  date_of_birth: string;
  address: string;
  contact: string;
}

export interface Policy {
  id: number;
  client_id: number;
  type: string;
  coverage_amount: number;
  premium: number;
  start_date: string;
  end_date: string;
}

export interface Claim {
  id: number;
  insurance_policy_id: number;
  description: string;
  claim_status: string;
  claim_date: string;
}

export type ClientInput = Omit<Client, "id">;
export type PolicyInput = Omit<Policy, "id">;
export type ClaimInput = Omit<Claim, "id">;

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export type ApiResponse<T> =
  | { data: T }
  | { error: { code: string; message: string; details?: string[] } };
