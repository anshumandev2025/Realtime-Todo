import { Router } from 'express';
import { getOrganizations, addMember } from './organization.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireOrgAdmin } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);
router.get('/', getOrganizations);
router.post('/:orgId/members', requireOrgAdmin, addMember);

export default router;
