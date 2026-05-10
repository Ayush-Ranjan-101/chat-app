import { Message } from "../models/message.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { getReceiverSocketId, io } from "../utils/socket.js";

const getMessage = asyncHandler(async (req, res) => {
  const { id: userToChatId } = req.params;
  const myId = req.user._id;

  // Added .sort({ createdAt: 1 }) to ensure messages appear in order
  const messages = await Message.find({
    $or: [
      { senderId: myId, receiverId: userToChatId },
      { senderId: userToChatId, receiverId: myId },
    ],
  }).sort({ createdAt: 1 });

  if (!messages) throw new ApiError(400, "Failed to fetch messages");

  return res
    .status(200)
    .json(new ApiResponse(200, { messages }, "Messages fetched successfully"));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { text } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user._id;

  // Check if at least one of text or image is present
  const imageLocalPath = req.files?.image?.[0]?.path;
  if (!text && !imageLocalPath) {
    throw new ApiError(400, "Message content cannot be empty");
  }

  let imageUrl;
  if (imageLocalPath) {
    const uploadedImage = await uploadOnCloudinary(imageLocalPath);
    imageUrl = uploadedImage?.url || "";
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    text,
    image: imageUrl,
  });

  // Real-time: Notify receiver of new message
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", newMessage);
  }

  return res
    .status(201)
    .json(new ApiResponse(201, { newMessage }, "Message sent successfully"));
});

const updateMessage = asyncHandler(async (req, res) => {
  const { messageId, text } = req.body;
  const myId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  if (message.senderId.toString() !== myId.toString()) {
    throw new ApiError(403, "You can only edit your own messages");
  }

  message.text = text;
  await message.save();

  // Real-time: Notify receiver that a message text has changed
  const receiverSocketId = getReceiverSocketId(message.receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageUpdated", message);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { message }, "Message updated successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.body;
  const myId = req.user._id;

  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  if (message.senderId.toString() !== myId.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  const receiverId = message.receiverId; // Store before deleting
  
  if (message.image) {
    await deleteFromCloudinary(message.image);
  }

  await Message.findByIdAndDelete(messageId);

  // Real-time: Notify receiver that a message was deleted
  const receiverSocketId = getReceiverSocketId(receiverId);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("messageDeleted", { messageId });
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted successfully"));
});

export { sendMessage, getMessage, updateMessage, deleteMessage };
