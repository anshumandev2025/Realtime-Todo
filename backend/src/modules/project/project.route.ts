import { Router } from "express";
import {
  createProject,
  getProjects,
  getProjectDetails,
} from "./project.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getProjects);

router.post("/", createProject);

router.get("/:id", getProjectDetails);

export default router;
