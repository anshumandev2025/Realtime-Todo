import { Router } from 'express';
import { createProject, getProjects, getProjectDetails } from './project.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireOrgAdmin, requireOrgMember } from '../../middleware/role.middleware';

const router = Router();

router.use(authenticate);

// List projects in an org
router.get('/organization/:organizationId', requireOrgMember, getProjects);

// Create a project (requires org admin or owner)
router.post('/', requireOrgAdmin, createProject);

// Get project details
router.get('/:id', getProjectDetails); // we should arguably add a specific middleware to check project membership

export default router;
