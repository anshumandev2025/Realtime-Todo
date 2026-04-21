import { Request, Response } from 'express';
import { catchAsync } from '../../utils/catch-async';
import { sendResponse } from '../../utils/response';
import { User } from '../../models/user.model';

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await User.findById(req.user?.id).populate('organizations');
  sendResponse(res, 200, true, 'User profile fetched successfully', user);
});
