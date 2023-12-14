import jwt, { SignOptions } from "jsonwebtoken";
import config from "config";
import fs from "fs";
import path from "path";

const loadPrivateKey = (privateKeyPath: string): string => {
  return fs.readFileSync(
    path.resolve(__dirname, "../../", privateKeyPath),
    "utf8"
  );
};

export const signJwt = (
  payload: Object,
  keyName: "accessTokenPrivateKey" | "refreshTokenPrivateKey",
  options: SignOptions
) => {
  return jwt.sign(payload, process.env.JWT_KEY ?? "");
};

export const verifyJwt = <T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY ?? "") as T;

    return decoded;
  } catch (error) {
    return null;
  }
};
