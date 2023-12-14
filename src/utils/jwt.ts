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
  const tokenPrivateKey = loadPrivateKey(config.get<string>(`${keyName}Path`));

  const privateKey = Buffer.from(tokenPrivateKey, "base64").toString("ascii");
  return jwt.sign(payload, privateKey, {
    ...(options && options),
    algorithm: "RS256",
  });
};

export const verifyJwt = <T>(
  token: string,
  keyName: "accessTokenPublicKey" | "refreshTokenPublicKey"
): T | null => {
  try {
    const publicKey = Buffer.from(
      config.get<string>(keyName),
      "base64"
    ).toString("ascii");
    const decoded = jwt.verify(token, publicKey) as T;

    return decoded;
  } catch (error) {
    return null;
  }
};
