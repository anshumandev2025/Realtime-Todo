import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catch-async';
import { AppError } from '../../utils/app-error';
import { sendResponse } from '../../utils/response';
import { Organization } from '../../models/organization.model';
import { User } from '../../models/user.model';

export const getOrganizations = catchAsync(async (req: Request, res: Response) => {
  const orgs = await Organization.find({
    $or: [{ owner: req.user?.id }, { 'members.user': req.user?.id }]
  }).populate('members.user', 'name username email');
  
  sendResponse(res, 200, true, 'Organizations fetched successfully', orgs);
});

export const addMember = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { orgId } = req.params;
  const { emailOrUsername, role } = req.body;

  if (!emailOrUsername) {
    return next(new AppError('Please provide email or username to invite', 400));
  }

  const userToAdd = await User.findOne({
    $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
  });

  if (!userToAdd) {
    return next(new AppError('User not found', 404));
  }

  const org = await Organization.findById(orgId);
  if (!org) return next(new AppError('Organization not found', 404));

  const isAlreadyMember = org.members.some(m => m.user.toString() === userToAdd.id);
  if (isAlreadyMember) {
    return next(new AppError('User is already a member of this organization', 400));
  }

  org.members.push({ user: userToAdd.id as any, role: role || 'member' });
  await org.save();

  userToAdd.organizations.push(org.id as any);
  await userToAdd.save();

  sendResponse(res, 200, true, 'Member added successfully', org);
});
