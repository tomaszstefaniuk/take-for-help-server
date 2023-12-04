import mongoose from "mongoose";
import config from "config";

const dbUrl = `mongodb+srv://${config.get("dbName")}:${config.get(
  "dbPass"
)}@cluster0.vr9pgty.mongodb.net/?retryWrites=true&w=majority`;

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
  }
};

export default connectDB;
