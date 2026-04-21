import { Router } from 'express';
import { getMe, getAllUsers } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/me', getMe);
router.get('/', getAllUsers);

export default router;
