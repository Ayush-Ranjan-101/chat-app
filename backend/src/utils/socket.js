import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fetchFriendsList } from "../controllers/user.controllers.js";

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }
});

const getReceiverSocketId = function  (userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; // {userId: socketId}

io.on("connection", async (socket) => {
  const userId = socket.handshake.query.userId;
  if (!userId) return;

  userSocketMap[userId] = socket.id;

  try {
    // Call the logic directly using the ID from the handshake
    const friends = await fetchFriendsList(userId); 

    // Notify online friends
    friends.forEach(friend => {
      const friendId = friend._id?.toString() || friend.toString();
      const friendSocketId = getReceiverSocketId(friendId);
      
      if (friendSocketId) {
        io.to(friendSocketId).emit("friendStatusChange", {
          userId: userId,
          status: "online"
        });
      }
    });

    // Send the user the current online status of their friends
    const onlineFriendIds = friends
      .map(f => f._id?.toString() || f.toString())
      .filter(id => userSocketMap[id]);

    socket.emit("initialFriendStatus", onlineFriendIds);

  } catch (error) {
    console.error("Error fetching friends in socket:", error);
  }

  socket.on("disconnect", async () => {
    // We fetch again to ensure we have the latest list to notify
    const friends = await fetchFriendsList(userId);
    delete userSocketMap[userId];

    friends.forEach(friend => {
      const friendId = friend._id?.toString() || friend.toString();
      const friendSocketId = getReceiverSocketId(friendId);
      if (friendSocketId) {
        io.to(friendSocketId).emit("friendStatusChange", {
          userId: userId,
          status: "offline"
        });
      }
    });
  });
});

export {app, server, io, getReceiverSocketId};
