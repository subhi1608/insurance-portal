import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import client from "../db/client";
import type { ClientInput, TokenPair } from "../../../types";

const getClients = async () => {
  try {
    return await client.getAllClients();
  } catch (error) {
    /* swallow — list endpoint returns undefined on failure */
  }
};

const getClientById = async (clientId: number) => {
  try {
    return await client.getClientById(clientId);
  } catch (error) {
    return error;
  }
};

const createClient = async (data: ClientInput) => {
  try {
    return await client.createClient(data);
  } catch (error) {
    return error;
  }
};

const updateClient = async (id: number, data: ClientInput) => {
  try {
    return await client.updateClient(id, data);
  } catch (error) {
    return error;
  }
};

const deleteClient = async (id: number) => {
  try {
    return await client.deleteClient(id);
  } catch (error) {
    return error;
  }
};

const _signTokens = (userId: number): TokenPair => {
  const accessToken = jwt.sign({ id: userId }, process.env.TOKEN as string, {
    expiresIn: "15m",
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: "7d",
  });
  return { accessToken, refreshToken };
};

const createUser = async (data: {
  email: string;
  password: string;
}): Promise<TokenPair | Error> => {
  try {
    const { email, password } = data;
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await client.createUser({ email, password: hashedPassword });
    const tokens = _signTokens(userId);
    await client.updateLoginStatus(userId, true);
    return tokens;
  } catch (error) {
    return error as Error;
  }
};

const loginUser = async (
  email: string,
  password: string
): Promise<TokenPair | Error | null> => {
  try {
    const user = await client.getUserByEmail(email);
    if (!user) return null;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return null;
    const tokens = _signTokens(user.id);
    await client.updateLoginStatus(user.id, true);
    return tokens;
  } catch (error) {
    return error as Error;
  }
};

const refreshAccessToken = async (
  refreshToken: string
): Promise<{ accessToken: string } | null> => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string);
    const accessToken = jwt.sign(
      { id: (decoded as jwt.JwtPayload).id },
      process.env.TOKEN as string,
      { expiresIn: "15m" }
    );
    return { accessToken };
  } catch (error) {
    return null;
  }
};

const logoutUser = async (id: number) => {
  try {
    await client.updateLoginStatus(id, false);
    return { message: "Logged out successfully" };
  } catch (error) {
    return error;
  }
};

const clientService = {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  createUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};

export default clientService;
