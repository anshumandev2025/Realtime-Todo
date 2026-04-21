import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catch-async";
import { AppError } from "../../utils/app-error";
import { sendResponse } from "../../utils/response";
import { Project } from "../../models/project.model";
import { Task } from "../../models/task.model";
import { User } from "../../models/user.model";

export const createProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user?.id,
      members: req.user?.id ? [req.user.id] : [],
    });

    sendResponse(res, 201, true, "Project created successfully", project);
  },
);

export const getProjects = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const projects = await Project.find({
    members: userId,
  }).populate("members", "name username email");

  sendResponse(res, 200, true, "Projects fetched successfully", projects);
});

export const getProjectDetails = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const project = await Project.findById(id)
      .populate("tasks")
      .populate("members", "name username email");
    if (!project) return next(new AppError("Project not found", 404));

    sendResponse(res, 200, true, "Project details fetched", project);
  },
);

export const updateProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const project = await Project.findById(id);
    if (!project) return next(new AppError("Project not found", 404));

    if (project.createdBy.toString() !== req.user?.id) {
      return next(new AppError("Only the project creator can edit this project", 403));
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    await project.save();

    const populated = await project.populate("members", "name username email");
    sendResponse(res, 200, true, "Project updated successfully", populated);
  },
);

export const deleteProject = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) return next(new AppError("Project not found", 404));

    if (project.createdBy.toString() !== req.user?.id) {
      return next(new AppError("Only the project creator can delete this project", 403));
    }

    // Remove all tasks belonging to this project
    await Task.deleteMany({ projectId: id });
    await Project.findByIdAndDelete(id);

    sendResponse(res, 200, true, "Project deleted successfully", null);
  },
);

export const addMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { userId } = req.body;

    const project = await Project.findById(id);
    if (!project) return next(new AppError("Project not found", 404));

    const userExists = await User.findById(userId);
    if (!userExists) return next(new AppError("User not found", 404));

    const alreadyMember = project.members.some(
      (memberId) => memberId.toString() === userId,
    );
    if (alreadyMember) {
      return next(new AppError("User is already a member of this project", 400));
    }

    project.members.push(userId);
    await project.save();

    const populated = await project.populate("members", "name username email");
    sendResponse(res, 200, true, "Member added successfully", populated);
  },
);

export const removeMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id, userId } = req.params;

    const project = await Project.findById(id);
    if (!project) return next(new AppError("Project not found", 404));

    if (project.createdBy.toString() !== req.user?.id) {
      return next(new AppError("Only the project creator can remove members", 403));
    }

    if (project.createdBy.toString() === userId) {
      return next(new AppError("Cannot remove the project creator", 400));
    }

    project.members = project.members.filter(
      (memberId) => memberId.toString() !== userId,
    ) as any;
    await project.save();

    const populated = await project.populate("members", "name username email");
    sendResponse(res, 200, true, "Member removed successfully", populated);
  },
);
