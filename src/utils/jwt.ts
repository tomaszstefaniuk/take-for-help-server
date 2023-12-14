import jwt, { SignOptions } from "jsonwebtoken";

export const signJwt = (payload: Object, options: SignOptions) => {
  return jwt.sign(payload, process.env.JWT_KEY ?? "", {
    ...(options && options),
  });
};

export const verifyJwt = <T>(token: string): T | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY ?? "") as T;

    return decoded;
  } catch (error) {
    return null;
  }
};
