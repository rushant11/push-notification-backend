const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const Token = require("./models/Token");

const connectDB = require("./db");

const app = express();

app.use(bodyParser.json());
app.use(cors());

connectDB();

app.get("/", (req, res) => {
  res.send("Welcome to the Push Notification Backend API with Heroku!!!!");
});

// Route to save token (already exists)
app.post("/save-token", async (req, res) => {
  try {
    const { token, name } = req.body;
    if (!token || !name)
      return res.status(400).json({ error: "Token and name are required" });

    const existingToken = await Token.findOne({ token });
    if (existingToken) {
      return res.status(200).json({ message: "Token already exists" });
    }

    const newToken = new Token({ token, name });
    await newToken.save();
    res.status(201).json({ message: "Token saved successfully" });
  } catch (error) {
    console.error("Error saving token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to send notification to all users
app.post("/api/send-notification", async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" });
    }

    const tokens = await Token.find();
    if (!tokens.length) {
      return res.status(404).json({ error: "No tokens found" });
    }

    const responses = await Promise.all(
      tokens.map((tokenDoc) => {
        console.log("🚀 ~ app.post ~ tokenDoc.name:", tokenDoc.name);
        return axios.post("https://exp.host/--/api/v2/push/send", {
          to: tokenDoc.token,
          sound: "default",
          title: `Hiii ${tokenDoc.name}`,
          body,
        });
      })
    );

    res
      .status(200)
      .json({ message: "Notifications sent successfully", responses });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
