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
import { isAdmin } from "../middlewares/role.middlewares.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";
import {
  deleteUserAccount,
  getAllUsers,
  getBlockedUsers,
  toggleBlockUser,
} from "../controllers/admin.controllers.js";
import { isBlocked } from "../middlewares/access.middlewares.js";
const router = Router();

// Unsecured routes
router.route("/signup").post(validate(signUpVSchema), signUp);
router.route("/login").post(validate(logInVSchema), logIn);

// Secured routes
router.use(verifyJWT);

router.route("/logout").post(logOut);

// Block protection
router.use(isBlocked);

router.route("/profile").put(
  upload.fields([
    {
      name: "profilePic",
      maxCount: 1,
    },
  ]),
  updateProfile,
);
router.route("/").get(getFriends);
router.route("/").delete(removeFriend);

router.route("/friends").get(getPotentialFriends);
router.route("/friends").post(sendFriendRequest);

router.route("/friends/requests").get(showFriendRequests);
router.route("/friends/requests").post(acceptFriendRequest);
router.route("/friends/requests").delete(discardFriendRequest);

// Admin secured routes
router.route("/users").get(isAdmin, getAllUsers);
router.route("/users").patch(isAdmin, toggleBlockUser);
router.route("/users/blocked").get(isAdmin, getBlockedUsers);
router.route("/users").delete(isAdmin, deleteUserAccount);

export default router;
