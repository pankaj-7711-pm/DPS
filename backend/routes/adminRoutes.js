import express from "express";
import { isAdmin, requireSignIn } from "../helpers/authHelpers.js";
import {
  changeStatusController,
  getAllActiveUsersController,
  getAllInactiveUsersController,
  getAllLogsController,
  getAllUsersController,
  getSingleUserController,
  getUserLogController,
} from "../controllers/adminController.js";

const router = express.Router();

//change user status
router.put("/changeStatus", requireSignIn, isAdmin, changeStatusController);

//fetch all users
router.get("/getAllUsers", requireSignIn, isAdmin, getAllUsersController);

//fetch only active users
router.get(
  "/getAllActiveUsers",
  requireSignIn,
  isAdmin,
  getAllActiveUsersController
);

//fetch only inactive users
router.get(
  "/getAllInactiveUsers",
  requireSignIn,
  isAdmin,
  getAllInactiveUsersController
);

//fetch a single user
router.post("/getOneUsers", requireSignIn, isAdmin, getSingleUserController);

//fetch all logs
router.get("/get-all-logs", requireSignIn, isAdmin, getAllLogsController);

//fetch logs of particular user
router.post("/get-user-logs", requireSignIn, isAdmin, getUserLogController);

export default router;
