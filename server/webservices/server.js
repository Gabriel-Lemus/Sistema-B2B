const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);

// ================================ Constants ================================
const LOCAL_HOST_IP = "localhost";
const TOMCAT_PORT = "8080";

// ================================= Routes =================================
app.post("/", (req, res) => {
  console.log(req);

  (async () => {
    // Check if the request has the brand parameter
    if (req.query.marca) {
      // Attempt to add the new brand
      const newBrand = req.query.marca;
      const uploadBrand = await axios.post(
        `http://${LOCAL_HOST_IP}:${TOMCAT_PORT}/sales-system/sales?table=marcas`,
        {
          nombre: newBrand,
        }
      );

      if (uploadBrand.data.success) {
        res.send({
          sucess: true,
          data: uploadBrand.data,
        });
      } else {
        res.send({
          sucess: false,
          data: uploadBrand.data,
        });
      }
    } else {
      res.send({
        sucess: false,
        error: "The brand name was not specified.",
      });
    }
  })();
});

app.get("/", (req, res) => {
  (async () => {
    const devices = await axios.get(
      "http://localhost:8080/sales-system/sellers?get=true&dispositivos=true"
    );

    res.send({
      method: "GET",
      success: true,
      devices: devices.data,
    });
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
