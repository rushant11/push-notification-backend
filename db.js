const mongoose = require("mongoose");

const uri =
  "mongodb+srv://rushant11:rushi_1112@rushant-cluster.wmc88.mongodb.net/pushTokens?retryWrites=true&w=majority";

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB Atlas!");
  } catch (error) { 
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
