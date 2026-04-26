import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middlewares.js";
import { validate } from "../middlewares/validate.middlewares.js";
import { messageValidationSchema } from "../validators/messageValidator.validators.js";
import {
  getMessage,
  sendMessage,
  updateMessage,
  deleteMessage,
} from "../controllers/message.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js";

const router = Router();

router.route("/:id").get(verifyJWT, getMessage);
router.route("/send/:id").post(
  verifyJWT,
  upload.fields([
    {
      name: "image",
      maxCount: 1,
    },
  ]),
  validate(messageValidationSchema),
  sendMessage,
);

router.route("/:id/update").patch(verifyJWT, updateMessage);
router.route("/:id/delete").delete(verifyJWT, deleteMessage);

export default router;
