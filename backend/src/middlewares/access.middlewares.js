import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const isBlocked = asyncHandler(async (req, res, next) => {
  const user = req.user;

  // Safety check: ensure verifyJWT ran before this
  if (!user) {
    throw new ApiError(401, "Authentication required");
  }

  if (user.isBlocked) {
    user.refreshToken = "";
    user.accessToken = "";

    await user.save({validateBeforeSave: false});

    // 403 is the standard for "I know who you are, but you aren't allowed to do this"
    throw new ApiError(
      403,
      "Your account has been suspended. Please contact support.",
    );
  }

  next();
});

export { isBlocked };
