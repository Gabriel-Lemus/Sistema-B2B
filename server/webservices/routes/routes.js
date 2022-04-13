require("dotenv").config();

const express = require("express");
const router = express.Router();
const axios = require("axios");

const LOCALHOST_IP = process.env.LOCAL_HOST_IP;
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
        `http://${LOCALHOST_IP}:${SALES_BE_PORT}/sales-system/sales?table=marcas`,
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
  } else if (
    params.sellerAsFactoriesClient !== undefined &&
    params.email !== undefined
  ) {
    const seller = params.sellerAsFactoriesClient;
    const email = params.email;
    const shippingTimes = [];

    // For every factory in the factories collection, add a new shipping time with the factory's id and 0 as shipping time
    try {
      const factories = await axios.get(
        `http://${LOCALHOST_IP}:${FACTORIES_BE_PORT}/factories`
      );

      if (factories.data.success) {
        factories.data.data.forEach((factory) => {
          shippingTimes.push({
            factoryId: factory._id,
            shippingTime: 0,
          });
        });
        const newClient = {
          name: seller,
          email: email,
          shippingTimes: shippingTimes,
        };

        // Attempt to add the seller as a client in the factories backend
        try {
          const addSellerAsClient = await axios.post(
            `http://${LOCALHOST_IP}:${FACTORIES_BE_PORT}/clients?registerSeller=true`,
            newClient
          );

          if (addSellerAsClient.data.success) {
            res.status(200).json({
              success: true,
              message: "Seller added as client successfully.",
              data: addSellerAsClient.data,
            });
          } else {
            res.status(400).json({
              success: false,
              message: "Error adding seller as client.",
              data: addSellerAsClient.data,
            });
          }
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error adding new client to factories backend: ${error.message}`,
          });
        }
      } else {
        res.status(400).json({
          success: false,
          message: "Error getting factories from factories backend.",
          data: factories.data,
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: `Error getting factories from factories backend: ${error.message}`,
      });
    }
  } else if (params.paidOrder !== undefined) {
    // Upload the devices from a paid order in the factories system to the sales backend
    const order = req.body;
    const clientName = order.clientName;
    const devices = order.devices;

    // Send the devices to the factories backend
    try {
      const addDevices = await axios.post(
        `http://${LOCALHOST_IP}:${SALES_BE_PORT}/sales-system/sellers?addPaidOrderDevices=${clientName}`,
        devices
      );

      if (addDevices.data.success) {
        res.status(200).json({
          success: true,
          message: "Devices added successfully",
          data: addDevices.data,
        });
      } else {
        res.status(400).json({
          success: false,
          message: `Error adding devices: ${addDevices.data.message}`,
          data: addDevices.data,
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: `Error uploading devices to factories backend: ${error.message}`,
      });
    }
  } else if (params.newOrder !== undefined) {
    // Upload a new order to the factories backend
    const order = req.body;
    const uploadOrder = await axios.post(
      `http://${LOCALHOST_IP}:${FACTORIES_BE_PORT}/orders?newOrderNoClientName=true`,
      order
    );

    if (uploadOrder.data.success) {
      res.status(200).json({
        success: true,
        message: "New order uploaded successfully",
        data: uploadOrder.data,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Error uploading new order",
        data: uploadOrder.data,
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
        `http://${LOCALHOST_IP}:${SALES_BE_PORT}/sales-system/sales?table=credenciales_usuarios&exists=${params.sellerEmail}`
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
  } else if (params.getFactoriesDevices !== undefined) {
    // Get the devices from the factories backend
    const devicesData = await axios.get(
      `http://${LOCALHOST_IP}:${FACTORIES_BE_PORT}/devices`
    );

    if (devicesData.data.success) {
      res.status(200).send({
        success: true,
        message: "Request successful.",
        data: devicesData.data.data,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Error getting the devices from the factories backend.",
      });
    }
  } else if (params.getFactoryDevice !== undefined) {
    // Get the data of a specific device from the factories backend
    const id = params.getFactoryDevice;
    const deviceData = await axios.get(
      `http://${LOCALHOST_IP}:${FACTORIES_BE_PORT}/devices/${id}`
    );

    if (deviceData.data.success) {
      res.status(200).send({
        success: true,
        message: "Request successful.",
        data: deviceData.data.data,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Error getting the device from the factories backend.",
      });
    }
  } else if (params.clientOrdersNoClientId !== undefined) {
    // Get the orders from the factories backend
    const clientName = params.clientOrdersNoClientId;
    const ordersData = await axios.get(
      `http://${LOCALHOST_IP}:${FACTORIES_BE_PORT}/orders?clientOrdersNoClientId=${clientName}`
    );

    if (ordersData.data.success) {
      res.status(200).send({
        success: true,
        message: "Request successful.",
        data: ordersData.data,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Error getting the orders from the factories backend.",
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
router.put("/", async (req, res) => {
  const params = req.query;

  if (params.updateOrders !== undefined) {
    // Update the orders in the factories backend
    const orders = req.body;
    const updateOrders = await axios.put(
      `http://${LOCALHOST_IP}:${FACTORIES_BE_PORT}/?updateOrders=true`,
      orders
    );

    if (updateOrders.data.success) {
      res.status(200).send({
        success: true,
        message: "Orders updated successfully.",
        data: updateOrders.data,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Error updating the orders.",
        data: updateOrders.data,
      });
    }
  } else if (params.payOrder !== undefined) {
    // Pay the order in the factories backend
    const orderId = params.payOrder;
    const payOrder = await axios.put(
      `http://${LOCALHOST_IP}:${FACTORIES_BE_PORT}/?payOrder=${orderId}`,
      {}
    );

    if (payOrder.data.success) {
      res.status(200).send({
        success: true,
        message: "Order paid successfully.",
        data: payOrder.data,
      });
    } else {
      res.status(400).send({
        success: false,
        message: "Error paying the order.",
        data: payOrder.data,
      });
    }
  } else {
    res.status(400).send({
      success: false,
      message: "Please provide the required parameters.",
    });
  }
});

// ================================== Delete ==================================
router.delete("/", async (req, res) => {
  res.status(400).send({
    success: false,
    message: "Please provide the required parameters.",
  });
});

module.exports = router;
