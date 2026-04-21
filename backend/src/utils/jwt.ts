import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';

export const generateAccessToken = (userId: string, accountType: string) => {
  return jwt.sign({ id: userId, accountType }, env.JWT_ACCESS_SECRET, {
    expiresIn: '15m',
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: '7d',
  });
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as jwt.JwtPayload;
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload;
};
