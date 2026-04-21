import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catch-async';
import { AppError } from '../../utils/app-error';
import { sendResponse } from '../../utils/response';
import { Project } from '../../models/project.model';
import { Organization } from '../../models/organization.model';

export const createProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { name, description, organizationId } = req.body;

  const project = await Project.create({
    name,
    description,
    organizationId,
    createdBy: req.user?.id,
    members: req.user?.id ? [req.user.id] : [],
  });

  const org = await Organization.findById(organizationId);
  if (org) {
    org.projects.push(project.id as any);
    await org.save();
  }

  sendResponse(res, 201, true, 'Project created successfully', project);
});

export const getProjects = catchAsync(async (req: Request, res: Response) => {
  const { organizationId } = req.params;
  
  const projects = await Project.find({ 
    organizationId,
    $or: [{ members: req.user?.id }] // only projects they belong to
  }).populate('members', 'name username email');

  sendResponse(res, 200, true, 'Projects fetched successfully', projects);
});

export const getProjectDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const project = await Project.findById(id).populate('tasks').populate('members', 'name username email');
  if (!project) return next(new AppError('Project not found', 404));

  sendResponse(res, 200, true, 'Project details fetched', project);
});
