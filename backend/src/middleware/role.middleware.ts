import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error';
import { Organization } from '../models/organization.model';

export const requireAccountType = (type: 'individual' | 'organization_owner') => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.accountType !== type) {
      return next(new AppError(`You do not have permission to perform this action. Required: ${type}`, 403));
    }
    next();
  };
};

export const requireOrgAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.params.orgId || req.body.organizationId;
    
    if (!orgId) {
      return next(new AppError('Organization ID is required', 400));
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return next(new AppError('Organization not found', 404));
    }

    if (org.owner.toString() === req.user?.id) {
      return next();
    }

    const member = org.members.find(m => m.user.toString() === req.user?.id);
    if (!member || member.role !== 'admin') {
      return next(new AppError('You must be an admin of this organization to perform this action', 403));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

export const requireOrgMember = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = req.params.orgId || req.body.organizationId || req.query.organizationId;
    
    if (!orgId) {
      return next(new AppError('Organization ID is required', 400));
    }

    const org = await Organization.findById(orgId);
    if (!org) {
      return next(new AppError('Organization not found', 404));
    }

    if (org.owner.toString() === req.user?.id) {
      return next();
    }

    const member = org.members.find(m => m.user.toString() === req.user?.id);
    if (!member) {
      return next(new AppError('You must be a member of this organization', 403));
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
