import { Message } from "../models/message.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getMessage = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  });

  if (!messages) throw new ApiError(400, "Failed to fetch messages");

  return res
    .status(200)
    .json(new ApiResponse(200, { messages }, "messages fetched successfully"));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;
  const imageLocalPath = req.files?.image?.[0]?.path;

  let imageUrl;
  if (imageLocalPath) {
    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    imageUrl = uploadedImage?.url || "";
  }

  const newMessage = new Message({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });

  await newMessage.save({ validateBeforeSave: false });

  return res
    .status(201)
    .json(new ApiResponse(200, { newMessage }, "Message sent successfully"));
});

const updateMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.body; // The ID of the message to update
  const { text } = req.body;
  const myId = req.user._id;

  if (!text) {
    throw new ApiError(400, "Text is required to update message");
  }

  // Find the message and ensure the logged-in user is the sender
  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.senderId.toString() !== myId.toString()) {
    throw new ApiError(403, "You can only edit your own messages");
  }

  // Update text
  message.text = text;
  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { message }, "Message updated successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.body;
  const myId = req.user._id;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  // Authorization check
  if (message.senderId.toString() !== myId.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  // If you want to delete the image from Cloudinary too, you would
  // call a deletion utility here using message.image URL/PublicID.

  await Message.findByIdAndDelete(messageId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted successfully"));
});

export { sendMessage, getMessage, updateMessage, deleteMessage };
