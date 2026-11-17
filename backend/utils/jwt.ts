import jwt from "jsonwebtoken";









const SESSION_LIFETIME = "30d";

export const tokenGenerator = ( payload: object, secret: string, expiresIn: string = SESSION_LIFETIME, ): string => {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};


export const verifyToken = (token: string, secret: string): jwt.JwtPayload | string => {
  return jwt.verify(token, secret);
};