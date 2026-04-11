import { Router } from "express";

import { validate } from "../middlewares/validate.middlewares.js";
import {
  signUpVSchema,
  logInVSchema,
} from "../validators/authValidator.validators.js";
import { signUp, logIn, logOut } from "../controllers/auth.controllers.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

// Unsecured routes
router.route("/signup").post(validate(signUpVSchema), signUp);
router.route("/login").post(validate(logInVSchema), logIn);

// Secured routes
router.route("/logout").post(verifyJWT, logOut);

export default router;
