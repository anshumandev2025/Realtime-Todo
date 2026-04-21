import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catch-async";
import { User } from "../../models/user.model";
import { AppError } from "../../utils/app-error";
import { sendResponse } from "../../utils/response";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt";

const sendTokenResponse = (user: any, statusCode: number, res: Response) => {
  const accessToken = generateAccessToken(user.id, user.accountType);
  const refreshToken = generateRefreshToken(user.id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    expires: new Date(Date.now() + 15 * 60 * 1000),
  });

  delete user.password;

  sendResponse(res, statusCode, true, "Authentication successful", {
    user,
    accessToken,
  });
};

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new AppError("Email or username already exists", 400));
    }

    const user = await User.create({
      name,
      username,
      email,
      password,
    });

    sendTokenResponse(user, 201, res);
  },
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { identifier, password } = req.body; // identifier can be email or username

    if (!identifier || !password) {
      return next(
        new AppError("Please provide email/username and password", 400),
      );
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return next(new AppError("Incorrect email/username or password", 401));
    }

    sendTokenResponse(user, 200, res);
  },
);

export const refresh = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return next(new AppError("No refresh token provided", 401));
    }

    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.id);

      if (!user) {
        return next(
          new AppError("User belonging to this token no longer exists", 401),
        );
      }

      sendTokenResponse(user, 200, res);
    } catch (err) {
      return next(new AppError("Invalid or expired refresh token", 401));
    }
  },
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.cookie("refreshToken", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.cookie("accessToken", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    sendResponse(res, 200, true, "Logged out successfully");
  },
);
