import { Router } from 'express';
import { getMe } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.get('/me', getMe);

export default router;
