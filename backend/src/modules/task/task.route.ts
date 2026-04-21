import { Router } from 'express';
import { createTask, updateTask, deleteTask, moveTask, getTasksByProject } from './task.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createTask);
router.patch('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/move', moveTask);
router.get('/project/:projectId', getTasksByProject);

export default router;
