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
  const { token } = req.body;
  if (!token) return res.status(400).send("Token is required");

  const existingToken = await Token.findOne({ token });
  if (existingToken) {
    return res.status(200).send("Token already exists");
  }

  const newToken = new Token({ token });
  await newToken.save();
  res.status(201).send("Token saved");
});

// Route to send notification to all users
app.post("/api/send-notification", async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required" });
  }

  // Fetch all tokens from the database
  const tokens = await Token.find();

  if (!tokens.length) {
    return res.status(404).json({ error: "No tokens found" });
  }

  try {
    const responses = await Promise.all(
      tokens.map((tokenDoc) =>
        axios.post("https://exp.host/--/api/v2/push/send", {
          to: tokenDoc.token,
          sound: "default",
          title,
          body,
        })
      )
    );
    res.status(200).json({ message: "Notifications sent", responses });
  } catch (error) {
    console.error("Error sending notifications:", error);
    res.status(500).json({ error: "Failed to send notification" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on Port ${PORT}`);
});
