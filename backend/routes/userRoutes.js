import express from "express";
import { isAdmin, requireSignIn } from "../helpers/authHelpers.js";
import { getAllDocsController, getFilterDocController, getOneDocController, uploadController } from "../controllers/userController.js";

const router = express.Router();

//upload document
router.post("/upload", requireSignIn, uploadController); 

//view all documents
router.get("/get-doc", requireSignIn, getAllDocsController);

//view single document
router.post("/get-single-doc", requireSignIn, getOneDocController);

//view filtered document
router.post("/filter-docs", requireSignIn, getFilterDocController);






export default router;
