require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

const PORT = process.env.FACTORIES_PORT;
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Attempts to connect to MongoDB.
 */
const connectToMongoDB = () => {
  try {
    mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
    });
  } catch (error) {
    console.log(`Error connecting to MongoDB: ${error}`);
  }
};

// Router
const router = require("./routes/routes");

// Connect to MongoDB
connectToMongoDB();

// Handle mongoose connection errors
const db = mongoose.connection;
db.on("error", (error) => console.log(`Error with MongoDB: ${error}`));
db.once("open", () => console.log("Connected to MongoDB"));

// App config
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);

// Start server
app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});
