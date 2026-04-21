import { Request, Response, NextFunction } from 'express';
import { catchAsync } from '../../utils/catch-async';
import { AppError } from '../../utils/app-error';
import { sendResponse } from '../../utils/response';
import { Task } from '../../models/task.model';
import { Project } from '../../models/project.model';
import { getSocketIO } from '../../sockets';

export const createTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, description, status, projectId, assignedTo, order, labels, checklist } = req.body;

  const project = await Project.findById(projectId);
  if (!project) return next(new AppError('Project not found', 404));

  const task = await Task.create({
    title,
    description,
    status,
    projectId,
    assignedTo,
    order,
    labels,
    checklist,
  });

  project.tasks.push(task.id as any);
  await project.save();

  // Socket broadcast to all project room members
  const io = getSocketIO();
  io.to(projectId.toString()).emit('task:create', task);

  sendResponse(res, 201, true, 'Task created successfully', task);
});

export const updateTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const updateData = req.body;

  const task = await Task.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!task) return next(new AppError('Task not found', 404));

  // Socket broadcast
  const io = getSocketIO();
  io.to(task.projectId.toString()).emit('task:update', task);

  sendResponse(res, 200, true, 'Task updated successfully', task);
});

export const deleteTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  const task = await Task.findById(id);
  if (!task) return next(new AppError('Task not found', 404));

  const projectId = task.projectId.toString();

  // Remove task from project's tasks array
  await Project.findByIdAndUpdate(projectId, { $pull: { tasks: task._id } });

  await Task.findByIdAndDelete(id);

  // Socket broadcast to all project room members
  const io = getSocketIO();
  io.to(projectId).emit('task:delete', { _id: id, projectId });

  sendResponse(res, 200, true, 'Task deleted successfully', null);
});

export const moveTask = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { newStatus, newOrder } = req.body;

  const task = await Task.findById(id);
  if (!task) return next(new AppError('Task not found', 404));

  task.status = newStatus;
  task.order = newOrder;
  await task.save();

  // Socket broadcast
  const io = getSocketIO();
  io.to(task.projectId.toString()).emit('task:move', task);

  sendResponse(res, 200, true, 'Task moved successfully', task);
});

export const getTasksByProject = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { projectId } = req.params;
  const tasks = await Task.find({ projectId }).sort({ order: 1 });

  sendResponse(res, 200, true, 'Tasks fetched successfully', tasks);
});
