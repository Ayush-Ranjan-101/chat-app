import { Router } from "express";

import { validate } from "../middlewares/validate.middlewares.js";
import {
  signUpVSchema,
  logInVSchema,
} from "../validators/authValidator.validators.js";
import {
  signUp,
  logIn,
  logOut,
  updateProfile,
} from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
const router = Router();

// Unsecured routes
router.route("/signup").post(validate(signUpVSchema), signUp);
router.route("/login").post(validate(logInVSchema), logIn);

// Secured routes
router.route("/logout").post(verifyJWT, logOut);
router.route("/profile").put(
  verifyJWT,
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  updateProfile,
);

export default router;
