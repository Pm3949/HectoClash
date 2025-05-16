import express from "express";
import {
  // createOrJoinMatch,
  submitAnswer,
  getAllMatches,
  getSingleMatch,
} from "../controllers/matchControllers.js";
import isAuthenticated from "../middleware/isAuthenticated.js";

const router = express.Router();

// router.route("/createOrJoin").post(isAuthenticated, createOrJoinMatch);
router.route("/submitAnswer").post(isAuthenticated, submitAnswer);
router.route("/getAllMatches").get(getAllMatches);

router.route("/:id").get(getSingleMatch);

export default router;
