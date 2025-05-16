import express from "express";
import {
  getTrainingProblem,
  checkTrainingAnswer,
} from "../controllers/trainigControllers.js";

const router = express.Router();

router.get("/problem", getTrainingProblem);
router.post("/submit", checkTrainingAnswer);

export default router;
