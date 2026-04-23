import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: String,
    image: String,
  },
  { timestamps: true },
);

messageSchema.index({ senderId: 1, receiverId: 1 });

export const Message = mongoose.model("Message", messageSchema);
