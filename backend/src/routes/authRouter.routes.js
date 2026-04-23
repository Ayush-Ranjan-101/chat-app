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
  getFriends,
  getPotentialFriends,
  sendFriendRequest,
  showFriendRequests,
  acceptFriendRequest,
  discardFriendRequest,
  removeFriend,
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
router.route("/").get(verifyJWT, getFriends);
router.route("/").delete(verifyJWT, removeFriend);

router.route("/friends").get(verifyJWT, getPotentialFriends);
router.route("/friends").post(verifyJWT, sendFriendRequest);

router.route("/friends/requests").get(verifyJWT, showFriendRequests);
router.route("/friends/requests").post(verifyJWT, acceptFriendRequest);
router.route("/friends/requests").delete(verifyJWT, discardFriendRequest);

export default router;
