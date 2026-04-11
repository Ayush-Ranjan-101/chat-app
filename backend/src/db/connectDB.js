import mongoose from "mongoose";

const connection = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}`,
    );
    console.log(`🟢 DB connected successfully!`);
  } catch (error) {
    console.error("🔴 DB connection failed:", error.message);
    process.exit(1);
  }
};

export default connection;
