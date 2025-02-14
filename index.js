import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { User } from "./schema/User.js";
import { City } from "./schema/City.js";
import { Flight } from "./schema/Flight.js";

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

async function authenticate(req, res, next) {
  try {
    // format: BEARER <token>
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) throw new Error("cannot be authorized!!");
    const payload = jwt.verify(token, process.env.SECRET_KEY);
    req.payload = payload;
    next();
  } catch (err) {
    return res.status(401).json({ message: err.message });
  }
}

app.get("/validate-token", authenticate, (req, res) => {
  return res.status(200).json({ message: "valid" });
});

app.post("/register", async (req, res) => {
  try {
    const { name, username, email, password } = req.body;
    const usernameAlreadyExists = await User.findOne({ username });
    if (usernameAlreadyExists) throw new Error("Username already exists");
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) throw new Error("Email already exists");

    await User.create({ name, username, email, password });
    const token = jwt.sign({ username }, process.env.SECRET_KEY);
    return res.status(200).json({ message: "User created successfully", token });
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
    const token = jwt.sign({ username }, process.env.SECRET_KEY);
    return res.status(200).json({ message: "User logged in successfully", token });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// app.get("/user", async (req, res) => {
//   try {
//     const { username } = req.payload;
//     if (!username) throw new Error("Cannot verify user");
//     const userData = await User.findOne({ username }, { password: 0 });
//     if (!userData) throw new Error("Could not fetch user data");
//     return res.status(200).json(userData);
//   } catch (error) {
//     return res.status(400).json({ message: error.message });
//   }
// });

app.get("/cities", async (req, res) => {
  try {
    const cities = await City.find({});
    if (!cities) throw new Error("Cities could not be fetched.");
    return res.status(200).json(cities);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

app.get("/flights", async (req, res) => {
  try {
    let { from, to, date } = req.query;
    const availableFlights = await Flight.find({ from, to, date });
    if (!availableFlights) throw new Error("No flights found");
    return res.status(200).json(availableFlights);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});
