require("dotenv").config();

const express = require("express");
const cors = require("cors");
const router = require("./routes/routes");

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", router);

// Start server
app.listen(3003, () => {
  console.log("Listening on http://localhost:3003");
});
