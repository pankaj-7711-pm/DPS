import express from "express";
import { isAdmin, requireSignIn } from "../helpers/authHelpers.js";
import { getAllDocsController, getOneDocController, uploadController } from "../controllers/userController.js";

const router = express.Router();

//upload document
router.post("/upload", requireSignIn, uploadController);

//view all documents
router.get("/get-doc", requireSignIn, getAllDocsController);

//view single document
router.get("/get-single-doc", requireSignIn, getOneDocController);






export default router;
