import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

const getAllUsers = asyncHandler(async (req, res) => {
  // Find all users except the current admin
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password -refreshToken",
  );

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

const toggleBlockUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Prevent admin from blocking themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "You cannot block yourself");
  }

  user.isBlocked = !user.isBlocked;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      ),
    );
});

const deleteUserAccount = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await User.findByIdAndDelete(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "User account deleted successfully"));
});

const getBlockedUsers = asyncHandler(async (req, res) => {
  const blockedUsers = await User.find({ isBlocked: true })
    .select("-password -refreshToken");

  if (!blockedUsers || blockedUsers.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, [], "No blocked users found")
    );
  }

  return res.status(200).json(
    new ApiResponse(200, blockedUsers, "Blocked users fetched successfully")
  );
});

export { getAllUsers, toggleBlockUser, deleteUserAccount, getBlockedUsers };
