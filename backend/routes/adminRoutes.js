import express from "express";
import { isAdmin, requireSignIn } from "../helpers/authHelpers.js";
import {
  changeStatusController,
  getAllActiveUsersController,
  getAllDocsController,
  getAllFilterLogsController,
  getAllInactiveUsersController,
  getAllLogsController,
  getAllUsersController,
  getFilterDocsController,
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

//fetch all docs
router.get("/get-all-documents", requireSignIn, isAdmin, getAllDocsController);

//fetch logs of particular user
router.post("/get-user-logs", requireSignIn, isAdmin, getUserLogController);

//apply filter
router.post("/filter-documents", requireSignIn, isAdmin, getFilterDocsController);

//fetch all filter logs
router.post("/get-filter-logs", requireSignIn, isAdmin, getAllFilterLogsController);

export default router;
