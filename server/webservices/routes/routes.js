require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");

const LOCAL_HOST_IP = process.env.LOCAL_HOST_IP;
const SALES_BE_PORT = process.env.SALES_BE_PORT;
const FACTORIES_BE_PORT = process.env.FACTORIES_BE_PORT;

// =============================== CRUD Routes ===============================
// ================================= Create ==================================
router.post("/", async (req, res) => {
  const params = req.query;

  // Add a new factory as a brand in the sales backend
  if (params.newBrand !== undefined) {
    try {
      const newBrand = { nombre: params.newBrand };
      const addNewBrand = await axios.post(
        `http://${LOCAL_HOST_IP}:${SALES_BE_PORT}/sales-system/sales?table=marcas`,
        newBrand
      );

      if (addNewBrand.data.success) {
        res.status(200).json({
          success: true,
          message: "New brand added successfully",
          data: addNewBrand.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Error adding new brand",
          data: addNewBrand.data,
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: "Error: " + error.message,
      });
    }
  } else {
    res.status(400).send({
      success: false,
      message: "Please provide the required parameters.",
    });
  }
});

// =================================== Read ===================================
router.get("/", async (req, res) => {
  const params = req.query;

  // Get the seller's data given its email
  if (params.sellerEmail !== undefined) {
    try {
      const sellerInfo = await axios.get(
        `http://${LOCAL_HOST_IP}:${SALES_BE_PORT}/sales-system/sales?table=credenciales_usuarios&exists=${params.sellerEmail}`
      );

      if (sellerInfo.data.success) {
        res.status(200).send({
          success: true,
          message: "Request successful.",
          userExists: sellerInfo.data.data !== undefined,
          data: sellerInfo.data.data !== undefined ? sellerInfo.data.data : {},
        });
      } else {
        res.status(400).send({
          success: false,
          message: "The seller email does not exist.",
        });
      }
    } catch (error) {
      res.status(400).send({
        success: false,
        message: `Error getting the seller's data: ${error}`,
      });
    }
  } else {
    res.status(400).send({
      success: false,
      message: "Please provide the required parameters.",
    });
  }
});

// ================================== Update ==================================
router.put("/", (req, res) => {
  res.status(400).send({
    success: false,
    message: "Please provide the required parameters.",
  });
});

// ================================== Delete ==================================
router.delete("/", async (req, res) => {
  res.status(400).send({
    success: false,
    message: "Please provide the required parameters.",
  });
});

module.exports = router;
