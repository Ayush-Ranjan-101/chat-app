import { User } from "../models/user.models.js";

export const fetchFriendsList = async (userId) => {
  try {
    const user = await User.findById(userId).select("friends");
    if (!user) return [];
    return user.friends || [];
  } catch (error) {
    console.error("Error fetching friends list:", error);
    return [];
  }
};
