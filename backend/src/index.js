import dotenv from "dotenv";
import connectDB from "./db/connectDB.js";
import { server } from "./utils/socket.js";
import "./app.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

const main = async () => {
  try {
    await connectDB();

    server.listen(port, () => {
      console.log(`✅ Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error", err);
    process.exit(1);
  }
};

main();
