import { Request, Response } from "express";
import { catchAsync } from "../../utils/catch-async";
import { sendResponse } from "../../utils/response";
import { User } from "../../models/user.model";

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id);
  sendResponse(res, 200, true, "User profile fetched successfully", user);
});

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await User.find({}, "name username email _id");
  sendResponse(res, 200, true, "Users fetched successfully", users);
});
