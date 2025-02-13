import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { User } from "./schema/user.js";

const app = express();
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`server started on port ${port}.`);
});

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.ATLAS_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas.");
  })
  .catch(() => {
    console.log("Could not connect to MongoDB Atlas!");
  });

app.get("/", (req, res) => {
  res.send("<h1>Welcome to Shankh</br>");
});

app.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const usernameAlreadyExists = await User.findOne({ username });
    if (usernameAlreadyExists) throw new Error("Username already exists");
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) throw new Error("Email already exists");

    await User.create({ name, username, email, password });
    return res.status(200).json({ message: "User created successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const userExists = await User.findOne({ username });
    if (!userExists) throw new Error("Invalid username or password");
    if (password !== userExists.password) throw new Error("Invalid username or password");
    return res.status(200).json({ message: "User logged in successfully" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

app.get("/user", async (req, res) => {
  try {
    const { username } = req.payload;
    if (!username) throw new Error("Cannot verify user");
    const userData = await User.findOne({ username }, { password: 0 });
    if (!userData) throw new Error("Could not fetch user data");
    return res.status(200).json(userData);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});
