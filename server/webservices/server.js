const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

// ================================= Routes =================================
app.post("/", (req, res) => {
  res.send({
    method: "POST",
    message: "Hello, world!",
  });
});

app.get("/", (req, res) => {
  (async () => {
    const devices = await axios.get(
      "http://localhost:8080/sales-system/sellers?get=true&dispositivos=true"
    );

    res.send({
      method: "GET",
      message: "Hello, world!",
      devices: devices.data,
    });
  })();

  (() => {
    console.log("Hello, world!");
  })();
});

app.put("/", (req, res) => {
  res.send({
    method: "PUT",
    message: "Hello, world!",
  });
});

app.delete("/", (req, res) => {
  res.send({
    method: "DELETE",
    message: "Hello, world!",
  });
});

// Listen on port 3003
app.listen(3003, () => {
  console.log("Listening on http://localhost:3003");
});
