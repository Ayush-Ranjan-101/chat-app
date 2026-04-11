import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/connectDB.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

const main = async () => {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`✅ Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error", err);
    process.exit(1);
  }
};

main();
