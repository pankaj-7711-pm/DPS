import express from "express";
import { isAdmin, requireSignIn } from "../helpers/authHelpers.js";
import { loginController, registerController } from "../controllers/authController.js";


const router = express.Router();

//register
router.post("/register", registerController);

//login
router.post("/login", loginController);

//protected user routes auth
router.get("/user-auth", requireSignIn, (req, res) => {
    res.status(200).send({ ok: true });
});

//protected admin routes auth
router.get("/admin-auth", requireSignIn, isAdmin, (req, res) => {
    res.status(200).send({ ok: true });
});


export default router;