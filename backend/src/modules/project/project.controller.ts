import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../../utils/catch-async";
import { AppError } from "../../utils/app-error";
import { sendResponse } from "../../utils/response";
import { Project } from "../../models/project.model";

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
