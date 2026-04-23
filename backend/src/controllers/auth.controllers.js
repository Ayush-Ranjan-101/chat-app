import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.accessToken = accessToken;
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("DEBUG ERROR", error);
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
};

const signUp = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const existedUser = await User.findOne({
    $or: [{ username: username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this username or emailId already exits");
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: createdUser },
        "User registered successfully",
      ),
    );
});

const logIn = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User does not exists");
  }

  const isPasswordValid = bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { refreshToken, accessToken } = await generateAccessAndRefreshToken(
    user._id,
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully",
      ),
    );
});

const logOut = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: "",
        accessToken: "",
      },
    },
    {
      returnDocument: "after",
    },
  );

  if (!user) {
    throw new ApiError(404, "User not found or already logged out");
  }

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const profilePicLocalPath = req.files?.profilePic?.[0]?.path;

  if (!profilePicLocalPath) {
    throw new ApiError(400, "Profile picture file is required");
  }

  const uploadResponse = await uploadOnCloudinary(profilePicLocalPath);

  if (!uploadResponse.url) {
    throw new ApiError(400, "Error while uploading profile picture");
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: { profilePic: uploadResponse.url },
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken");

  return res.status(200).json(
    new ApiResponse(
      200,
      { user: updatedUser }, // Directly return the result of the update
      "Profile pic updated successfully",
    ),
  );
});

const getFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    "friends",
    "_id username profilePic isBlocked",
  );

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { friends: user.friends },
        "friends fetched successfully",
      ),
    );
});

const getPotentialFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const Allusers = await User.find({
    $and: [
      { _id: { $ne: user } }, // Not me
      { _id: { $nin: user.friends } }, // Not already friends
      { _id: { $nin: user.friendsRequests } }, // Not already requested
    ],
  }).select("_id username profilePic");

  if (!Allusers) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, { Allusers }, "All users fetched successfully"));
});

const sendFriendRequest = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body;
  const loggedInUserId = req.user._id;

  const targetUser = await User.findById(targetUserId);

  if (!targetUser) throw new ApiError(404, "User not found");

  if (targetUser.friendsRequests.includes(loggedInUserId)) {
    return res
      .status(400)
      .json(new ApiResponse(400, {}, "Request already sent"));
  }

  targetUser.friendsRequests.push(loggedInUserId);

  const friend = await User.findById(targetUserId).select(
    "-password -accessToken -refreshToken -friends",
  );

  await targetUser.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { friend }, "Friend request sent successfully"));
});

const showFriendRequests = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;

  // Find the user and populate the 'friendsRequests' array with specific fields
  const user = await User.findById(loggedInUserId)
    .populate("friendsRequests", "username email profilePic")
    .select("friendsRequests");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { requests: user.friendsRequests },
        "Friend requests fetched successfully",
      ),
    );
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requesterId } = req.body; // The ID of the person who sent the request
  const loggedInUserId = req.user._id; // The person clicking "Accept"

  // 1. Check if the request exists before proceeding
  const user = await User.findById(loggedInUserId);
  if (!user.friendsRequests.includes(requesterId)) {
    throw new ApiError(400, "No pending friend request from this user");
  }

  // 2. Update the Logged-in User (Recipient)
  // Pull from requests and add to friends
  await User.findByIdAndUpdate(loggedInUserId, {
    $pull: { friendsRequests: requesterId },
    $addToSet: { friends: requesterId },
  });

  // 3. Update the Requester (Sender)
  // Add the logged-in user to their friends list
  await User.findByIdAndUpdate(requesterId, {
    $addToSet: { friends: loggedInUserId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Friend request accepted successfully"));
});

const discardFriendRequest = asyncHandler(async (req, res) => {
  const { requestedId } = req.body;
  const loggedInUser = req.user._id;

  const newUser = await User.findOneAndUpdate(
    loggedInUser,
    {
      $pull: { friendsRequests: requestedId },
    },
    {
      returnDocument: "after",
    },
  ).select("-password -refreshToken -accessToken");

  if (!newUser) throw new ApiError(404, "Failed to discard request");

  return res.status(200).json(new ApiResponse(200, {requests: newUser.friendsRequests}));
});

const removeFriend = asyncHandler(async (req, res) => {
  const { targetUserId } = req.body; // The ID of the friend to be removed
  const loggedInUserId = req.user._id;

  // 1. Check if the target user exists
  const targetUser = await User.findById(targetUserId);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // 2. Perform the mutual removal
  // Remove targetUserId from logged-in user's 'friends' array
  const updatedUser = await User.findByIdAndUpdate(
    loggedInUserId,
    {
      $pull: { friends: targetUserId },
    },
    {
      returnDocument: "after"
    }
  ).select("-password -refreshToken -accessToken");

  // Remove logged-in user from the target user's 'friends' array
  await User.findByIdAndUpdate(targetUserId, {
    $pull: { friends: loggedInUserId },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedUser, "Friend removed successfully"));
});

export {
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
};
