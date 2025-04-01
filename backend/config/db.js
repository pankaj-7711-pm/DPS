import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`connection sucessfull ${conn.connection.host}`);
  } catch (error) {
    console.log(`Error in MongoDB ${error}`.bgRed.white);
  }
};

export default connectDB;
