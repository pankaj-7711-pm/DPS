import express from "express";
import { isAdmin, requireSignIn } from "../helpers/authHelpers.js";
import {
  changeStatusController,
  getAllActiveUsersController,
  getAllInactiveUsersController,
  getAllUsersController,
  getSingleUserController,
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
router.get("/getOneUsers", requireSignIn, isAdmin, getSingleUserController);

export default router;
