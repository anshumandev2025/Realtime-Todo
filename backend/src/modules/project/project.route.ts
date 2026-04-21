import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectDetails,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} from "./project.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectDetails);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);

export default router;
