// Basic Lib Import
const express = require("express");
const router = require("./src/routes/api");
const app = new express();
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// Security Middleware Lib Import
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

// Database Lib Import
const mongoose = require("mongoose");
app.use(express.static("../client-side/build"));

// Security Middleware Implement
app.use(cors());
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
// implement Json Data Limit
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));
// Body Parser Implement
app.use(bodyParser.json());

// Request Rate Limit
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 3000 });
app.use(limiter);

// Mongo DB Database Connection
let URI = process.env.MONGODB_URL;

let OPTION = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};
// mongoose.set("strictQuery", false);
async function ConnectDB() {
  try {
    await mongoose.connect(URI, OPTION);
    console.log("Database Connected");
  } catch (error) {
    console.log(error);
    console.log("MongoDB Connection Error");
  }
}
ConnectDB();
// Routing Implement
app.use("/api/v1", router);

// Undefine Route Implement
app.use("*", (req, res) => {
  res.status(404).json({ status: "Fail", data: "Not Found" });
});

// Add React Front End Routing
// app.get("*", function (req, res) {
//   res.
// });

module.exports = app;
