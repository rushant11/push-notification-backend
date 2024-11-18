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
app.post("/api/save-token", async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }
    const newToken = new Token({ token });
    await newToken.save();
    res.status(200).json({ message: "Token saved successfully" });
  res.send("Token saved successfully");
});

// Route to send notification to all users
app.post("/api/send-notification", async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }

  // Fetch all tokens from the database
  const tokens = await Token.find();

  // Send notifications to all tokens
  const messages = tokens.map((tokenDoc) => ({
    to: tokenDoc.token,
    sound: "default",
    title,
    body,
  }));

  try {
    const response = await axios.post("https://exp.host/--/api/v2/push/send", {
      messages,
    });
    res.status(200).json({ message: "Notifications sent", response });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notifications" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
