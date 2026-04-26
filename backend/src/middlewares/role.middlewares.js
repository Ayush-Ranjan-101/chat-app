import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";

const isAdmin = asyncHandler((req, res, next) => {
  if (req.user.role === "admin") {
    next();
  } else {
    throw new ApiError(403, "Access denied. Admin only");
  }
});

export { isAdmin };
