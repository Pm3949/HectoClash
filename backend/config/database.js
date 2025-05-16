import mongoose from "mongoose";

const connectDB = async () => {
  try {


    await mongoose.connect(process.env.MONGO_URI).then(() => {
      console.log("Database connected successfully");
    });
  } catch (error) {
    console.error("Database connection error:", error.message);
    process.exit(1); // Exit with failure
  }
};

export default connectDB;
