const express = require("express");
const axios = require("axios");
const router = express.Router();

// Environment variables
const LOCALHOST_IP = process.env.LOCALHOST_IP;
const WEBSERVICES_PORT = process.env.WEBSERVICES_PORT;

// Existing schemas
const existingSchemas = ["factories", "devices", "clients", "orders"];
const schemas = {};
schemas[existingSchemas[0]] = {
  schema: require("../models/factories"),
  fields: ["name", "email", "salt", "hash"],
  nonRepeatingFields: ["name", "email"],
  nameField: "_id",
};
schemas[existingSchemas[1]] = {
  schema: require("../models/devices"),
  fields: [
    "factoryId",
    "name",
    "description",
    "price",
    "model_code",
    "color",
    "category",
    "warranty_time",
    "shipping_time",
    "images",
  ],
  nonRepeatingFields: [],
  nameField: "_id",
};
schemas[existingSchemas[2]] = {
  schema: require("../models/clients"),
  fields: ["name", "email", "shippingTimes"],
  nonRepeatingFields: ["name", "email"],
  nameField: "name",
};
schemas[existingSchemas[3]] = {
  schema: require("../models/orders"),
  fields: ["clientId", "completed", "maxDeliveryDate", "devices"],
  nonRepeatingFields: [],
  nameField: "_id",
};

// Functions
/**
 * Check if the schema exists.
 * @param {string} schemaName - The name of the schema.
 * @returns {boolean} - True if the schema exists, false otherwise.
 */
const schemaExists = (schemaName) => {
  return existingSchemas.includes(schemaName);
};

// =============================== CRUD Routes ===============================
// ================================= Create ==================================
router.post("/", (req, res) => {
  res.status(400).send({
    success: false,
    message: "Please provide the name of the schema as a parameter.",
  });
});

router.post("/:schema", async (req, res) => {
  const schemaName = req.params.schema;

  // Check if the schema exists
  if (!schemaExists(schemaName)) {
    // Schema does not exist
    if (schemaName === undefined) {
      res.status(400).send({
        success: false,
        message: "Please provide the schema parameter.",
      });
    } else {
      res.status(400).send({
        success: false,
        message: `The schema '${schemaName}' does not exist.`,
      });
    }
  } else {
    const paramsNumber = Object.keys(req.body).length;

    if (paramsNumber === 0) {
      // Try to create the new document
      try {
        const body = req.body;
        const requiredFields = schemas[schemaName].fields;
        const missingFields = requiredFields.filter((field) => {
          return !Object.keys(body).includes(field);
        });

        // Check if the required fields are missing
        if (missingFields.length === 0) {
          const nonRepeatingFields = schemas[schemaName].nonRepeatingFields;
          let nonRepeatingFieldsExist = false;

          // Iterate through the non-repeating fields and check if they exist
          for (
            let i = 0;
            i < schemas[schemaName].nonRepeatingFields.length;
            i++
          ) {
            const field = nonRepeatingFields[i];
            const fieldValue = body[field];

            if (fieldValue !== undefined) {
              const existingDocuments = await schemas[schemaName].schema.find({
                [field]: fieldValue,
              });

              if (existingDocuments.length > 0) {
                nonRepeatingFieldsExist = true;
                break;
              }
            }
          }

          // Check if a document with the same non-repeating field already exists
          if (!nonRepeatingFieldsExist) {
            const newDocument = new schemas[schemaName].schema(body);
            await newDocument.save();
            res.status(201).send({
              success: true,
              message: "Document created successfully.",
              dataAdded: newDocument,
            });
          } else {
            res.status(400).send({
              success: false,
              message:
                "A document with the same non-repeating fields already exists.",
            });
          }
        } else {
          res.status(400).send({
            success: false,
            message: `The following fields are required: '${missingFields.join(
              "', '"
            )}'.`,
          });
        }
      } catch (error) {
        return res.status(500).send({
          success: false,
          error: `Error creating ${schemaName}: ${error}`,
        });
      }
    } else {
      const params = req.query;

      if (params.newOrder !== undefined && schemaName === existingSchemas[3]) {
        const order = req.body;
        let maxDeliveryDate = null;

        // Get the client's shipping times
        const clientShippingTimes = await schemas[existingSchemas[2]].schema
          .findOne({
            _id: order.clientId,
          })
          .select("shippingTimes");

        // Iterate through the devices in the order
        for (let i = 0; i < order.devices.length; i++) {
          const device = order.devices[i];
          const deviceShippingTimeDays = await schemas[
            existingSchemas[1]
          ].schema
            .findOne({
              _id: device.deviceId,
            })
            .select("shipping_time");

          // Find the client's shipping time in the clientShippingTimes array where the factoryId matches the device's factoryId
          const clientShippingTimeDays = clientShippingTimes.shippingTimes.find(
            (shippingTime) =>
              shippingTime.factoryId.toString() === device.factoryId
          ).shippingTime;

          // The estimated delivery date is the device's shipping time in days plus the client's shipping time in days for the given factory
          const estimatedDeliveryDateDays =
            deviceShippingTimeDays.shipping_time + clientShippingTimeDays;
          const estimatedDeliveryDate = new Date(
            new Date().getTime() +
              estimatedDeliveryDateDays * 24 * 60 * 60 * 1000
          );

          // Round the estimated delivery date
          const estimatedDeliveryDateRounded = new Date(
            estimatedDeliveryDate.getTime() +
              24 * 60 * 60 * 1000 -
              (estimatedDeliveryDate.getTime() % (24 * 60 * 60 * 1000))
          );

          if (i === 0) {
            maxDeliveryDate = estimatedDeliveryDateRounded;
          } else {
            if (estimatedDeliveryDateRounded > maxDeliveryDate) {
              maxDeliveryDate = estimatedDeliveryDateRounded;
            }
          }

          // Set the device's estimated delivery date
          device.estimatedDeliveryDate = estimatedDeliveryDateRounded;
        }

        // Set the order's max delivery date
        order.maxDeliveryDate = maxDeliveryDate;

        // Try to create the new document for the order
        try {
          const newOrderDocument = new schemas[schemaName].schema(order);
          await newOrderDocument.save();
          res.status(201).send({
            success: true,
            message: "Document created successfully.",
            dataAdded: newOrderDocument,
          });
        } catch (error) {
          return res.status(500).send({
            success: false,
            error: `Error creating creating the new order: ${error}`,
          });
        }
      } else if (params.registerSeller !== undefined) {
        const seller = req.body;

        // Try to create the new document for the seller
        try {
          const newSellerDocument = new schemas[schemaName].schema(seller);
          await newSellerDocument.save();
          res.status(201).send({
            success: true,
            message: "Client document created successfully.",
            dataAdded: newSellerDocument,
          });
        } catch (error) {
          return res.status(500).send({
            success: false,
            error: `Error creating creating the new seller: ${error}`,
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Please provide a valid parameter.",
        });
      }
    }
  }
});

// =================================== Read ===================================
router.get("/", (req, res) => {
  res.status(400).send({
    success: false,
    message: "Please provide the name of the schema as a parameter.",
  });
});

// Read (all)
router.get("/:schema", async (req, res) => {
  const schemaName = req.params.schema;

  // Check if the schema exists
  if (!schemaExists(schemaName)) {
    // Schema does not exist
    if (schemaName === undefined) {
      res.status(400).send({
        success: false,
        message: "Please provide the schema parameter.",
      });
    } else {
      res.status(400).send({
        success: false,
        message: `The schema '${schemaName}' does not exist.`,
      });
    }
  } else {
    const paramsNumber = Object.keys(req.query).length;
    const schema = schemas[schemaName].schema;

    if (paramsNumber === 0) {
      // Try to get all documents
      try {
        // Get all the attributes of the documents except for __v
        const data = await schema.find({}, { __v: 0 });
        const documentsCount = data.length;
        res.status(200).send({
          success: true,
          count: documentsCount,
          data,
        });
      } catch (error) {
        res.status(500).send({
          success: false,
          message: `Error getting data from ${schemaName}: ${error}`,
        });
      }
    } else {
      const params = req.query;

      if (
        params.emailExists !== undefined &&
        params.factoryExists !== undefined &&
        schemaName === existingSchemas[0]
      ) {
        try {
          // Try to get the document with the given email or name
          const data = await schema.findOne({
            $or: [
              { email: params.emailExists },
              { name: params.factoryExists },
            ],
          });
          res.status(200).send({
            success: true,
            factoryExists:
              data !== null ? data.name === params.factoryExists : false,
            emailExists:
              data !== null ? data.email === params.emailExists : false,
            canAddFactory: data === null,
            data,
          });
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error getting data from ${schemaName}: ${error}`,
          });
        }
      } else if (
        params.emailExists !== undefined &&
        schemaName === existingSchemas[0]
      ) {
        try {
          // Try to get the document with the given email
          const data = await schema.findOne({ email: params.emailExists });
          res.status(200).send({
            success: true,
            emailExists: data !== null,
            data,
          });
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error getting data from ${schemaName}: ${error}`,
          });
        }
      } else if (
        params.factoryDevices !== undefined &&
        schemaName === existingSchemas[1]
      ) {
        const factoryName = params.factoryDevices;

        // Check if the factory exists
        try {
          const factory = await schemas.factories.schema.findOne({
            name: factoryName,
          });

          if (factory !== null) {
            // Aggregate all the devices of the factory
            const devices = await schemas.devices.schema.aggregate([
              {
                $match: {
                  factoryId: factory._id.toString(),
                },
              },
              {
                $project: {
                  _id: 1,
                  name: 1,
                  description: 1,
                  price: 1,
                  model_code: 1,
                  color: 1,
                  category: 1,
                  warranty_time: 1,
                  shipping_time: 1,
                  images: 1,
                },
              },
              { $sort: { _id: 1 } },
            ]);

            res.status(200).send({
              success: true,
              count: devices.length,
              data: devices,
            });
          } else {
            res.status(400).send({
              success: false,
              message: `The factory '${factoryName}' does not exist.`,
            });
          }
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error getting data from ${schemaName}: ${error}`,
          });
        }
      } else if (
        params.clientOrders !== undefined &&
        schemaName === existingSchemas[3]
      ) {
        const clientId = params.clientOrders;
        const deliveredOrders = [];
        const pendingOrders = [];
        const cancelledOrders = [];

        // Get all the orders of the client
        try {
          const orders = await schemas.orders.schema.find({
            clientId: clientId,
          });

          for (let i = 0; i < orders.length; i++) {
            const order = JSON.parse(JSON.stringify(orders[i]));

            // Iterate through the devices in the order and add the device's name to the order
            for (let j = 0; j < order.devices.length; j++) {
              const deviceId = order.devices[j].deviceId;
              const device = await schemas.devices.schema.findOne({
                _id: deviceId,
              });

              order.devices[j].name = device.name;
            }

            if (order.completed && !order.canceled) {
              deliveredOrders.push(order);
            } else if (!order.canceled) {
              pendingOrders.push(order);
            } else {
              cancelledOrders.push(order);
            }
          }

          res.status(200).send({
            success: true,
            deliveredOrdersNumber: deliveredOrders.length,
            deliveredOrders,
            pendingOrdersNo: pendingOrders.length,
            pendingOrders,
            cancelledOrdersNo: cancelledOrders.length,
            cancelledOrders,
          });
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error getting data from ${schemaName}: ${error}`,
          });
        }
      } else if (
        params.nonDeliveredOrders !== undefined &&
        schemaName === existingSchemas[3]
      ) {
        const factoryId = params.nonDeliveredOrders;
        const nonDeliveredOrders = [];

        try {
          // Get all the orders
          const allOrders = await schemas.orders.schema.find({});

          // Iterate through the orders
          for (let i = 0; i < allOrders.length; i++) {
            // Iterate through the devices in the order
            for (let j = 0; j < allOrders[i].devices.length; j++) {
              // Check if the device belongs to the factory
              const deviceId = allOrders[i].devices[j].deviceId;
              const device = await schemas.devices.schema.findOne({
                _id: deviceId,
              });

              if (device.factoryId.toString() === factoryId) {
                // Check if the order is completed
                if (
                  !allOrders[i].completed &&
                  !allOrders[i].devices[j].delivered
                ) {
                  // Get the name of the client
                  const client = await schemas.clients.schema.findOne({
                    _id: allOrders[i].clientId,
                  });

                  // Add the order to the list of non-delivered orders, with the id of the client
                  nonDeliveredOrders.push({
                    client: { id: allOrders[i].clientId, name: client.name },
                    orderId: allOrders[i]._id,
                    orderDevice: allOrders[i].devices[j],
                    deviceData: device,
                  });
                }
              }
            }
          }

          res.status(200).send({
            success: true,
            nonDeliveredOrdersNo: nonDeliveredOrders.length,
            nonDeliveredOrders,
          });
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error getting data from ${schemaName}: ${error}`,
          });
        }
      } else {
        res.status(400).send({
          success: false,
          message: "Please provide a valid parameter.",
        });
      }
    }
  }
});

// Read (one)
router.get("/:schema/:name", async (req, res) => {
  const schemaName = req.params.schema;
  const name = req.params.name;

  // Check if the schema exists
  if (!schemaExists(schemaName)) {
    // Schema does not exist
    if (schemaName === undefined) {
      res.status(400).send({
        success: false,
        message: "Please provide the schema parameter.",
      });
    } else {
      res.status(400).send({
        success: false,
        message: `The schema '${schemaName}' does not exist.`,
      });
    }
  } else {
    const schema = schemas[schemaName].schema;
    const nameField = schemas[schemaName].nameField;

    // Try to get the document
    try {
      const data = await schema.findOne({ [nameField]: name }, { __v: 0 });

      if (data !== null) {
        res.status(200).send({
          success: true,
          data,
        });
      } else {
        res.status(404).send({
          success: false,
          message: `The document with name '${name}' does not exist.`,
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: `Error getting data from ${schemaName}: ${error}`,
      });
    }
  }
});

// ================================== Update ==================================
router.put("/", async (req, res) => {
  const params = req.query;
  const paramsNumber = Object.keys(req.query).length;

  if (paramsNumber !== 0) {
    if (
      params.deviceId !== undefined &&
      params.schema !== undefined &&
      params.schema === existingSchemas[1]
    ) {
      const deviceId = params.deviceId;
      const schema = schemas[params.schema].schema;

      // Check if the device exists
      try {
        const device = await schema.findOne({ _id: deviceId });

        if (device !== null) {
          // Iterate through the body and update the device
          for (const [key, value] of Object.entries(req.body)) {
            device[key] = value;
          }

          // Update the device
          try {
            await device.save();
            res.status(200).send({
              success: true,
              message: "The device has been updated.",
              newDeviceData: device,
            });
          } catch (error) {
            res.status(500).send({
              success: false,
              message: `Error updating the device: ${error}`,
            });
          }
        } else {
          res.status(400).send({
            success: false,
            message: `The device with id '${deviceId}' does not exist.`,
          });
        }
      } catch (error) {
        res.status(500).send({
          success: false,
          message: `Error updating data from ${params.schema}: ${error}`,
        });
      }
    } else if (params.updateOrders !== undefined) {
      const orders = req.body.orders;
      let changedOrders = [];

      // Iterate through the orders and update them
      for (let i = 0; i < orders.length; i++) {
        const orderId = req.body.orders[i]._id;
        const schema = schemas[existingSchemas[3]].schema;

        // Check if the order exists
        try {
          let order = await schema.findOne({ _id: orderId });

          if (order !== null) {
            // Iterate through the body and update the order
            for (const [key, value] of Object.entries(req.body.orders[i])) {
              if (key !== "devices") {
                order[key] = value;
              } else {
                order[key] = JSON.parse(JSON.stringify(value));
              }
            }

            // Check if the order has any device with the toDelete property set to true
            for (let j = 0; j < order.devices.length; j++) {
              if (
                order.devices[j].toDelete ||
                order.devices[j].quantity === 0
              ) {
                // Remove the device from the order
                order.devices.splice(j, 1);
                j--;
              }
            }

            // If the order is left with no devices, set the canceled property to true
            if (order.devices.length === 0) {
              order.canceled = true;
            }

            // Update the order
            try {
              await order.save();
              changedOrders.push(order);
            } catch (error) {
              res.status(500).send({
                success: false,
                message: `Error updating the order: ${error}`,
              });
            }
          } else {
            res.status(400).send({
              success: false,
              message: `The order with id '${orderId}' does not exist.`,
            });
          }
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error updating data from ${existingSchemas[3]}: ${error}`,
          });
        }
      }

      res.status(200).send({
        success: true,
        message: "The orders have been updated.",
        changedOrders,
      });
    } else if (
      params.deliverOrder !== undefined &&
      params.deviceId !== undefined
    ) {
      const orderId = params.deliverOrder;
      const deviceId = params.deviceId;

      try {
        const order = await schemas[existingSchemas[3]].schema.findOne({
          _id: orderId,
        });
        const x = 5;

        // Update the device in the devices array in the order
        for (let i = 0; i < order.devices.length; i++) {
          if (order.devices[i]._id.toString() === deviceId) {
            order.devices[i].delivered = true;
            order.devices[i].deliveredDate = new Date();
            break;
          }
        }

        // Check if all the devices in the order have been delivered so that the order can be marked as completed
        let allDelivered = true;
        for (let i = 0; i < order.devices.length; i++) {
          if (!order.devices[i].delivered) {
            allDelivered = false;
            break;
          }
        }

        // If all the devices have been delivered, set the order as completed
        if (allDelivered) {
          order.completed = true;
          order.deliveredDate = new Date();
        }

        // Update the order
        try {
          await order.save();
          res.status(200).send({
            success: true,
            message: "The order has been updated.",
            newOrderData: order,
          });
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error updating the order: ${error}`,
          });
        }
      } catch (error) {
        res.status(500).send({
          success: false,
          message: `Error updating data from ${existingSchemas[3]}: ${error}`,
        });
      }
    } else if (params.payOrder !== undefined) {
      const orderId = params.payOrder;

      try {
        // Array that will contain the information of the devices that have been paid for
        let orderDevices = [];

        // Get the order given its id
        const order = await schemas[existingSchemas[3]].schema.findOne({
          _id: orderId,
        });

        // Get the client's information
        const client = await schemas[existingSchemas[2]].schema.findOne({
          _id: order.clientId.toString(),
        });

        // Get the factories' information
        const factories = await schemas[existingSchemas[0]].schema.find({
          _id: { $in: order.devices.map((device) => device.factoryId) },
        });

        // Pay the order
        order.completelyPayed = true;

        // Iterate through the devices of the order and set the payed and canBeDisplayed properties to true
        for (let i = 0; i < order.devices.length; i++) {
          order.devices[i].payed = true;
          order.devices[i].canBeDisplayed = true;
        }

        // Get the devices data that belong to the order
        const factoriesDevices = await schemas[existingSchemas[1]].schema.find({
          _id: { $in: order.devices.map((device) => device.deviceId) },
        });

        // Populate the orderDevices array with the devices of the order
        for (let i = 0; i < order.devices.length; i++) {
          for (let j = 0; j < factoriesDevices.length; j++) {
            if (
              order.devices[i].deviceId.toString() ===
              factoriesDevices[j]._id.toString()
            ) {
              // Add the devices data from factoriesDevices as well as the quantity from the order
              orderDevices.push({
                ...factoriesDevices[j]._doc,
                quantity: order.devices[i].quantity,
                brand: factories.find(
                  (factory) =>
                    factory._id.toString() ===
                    order.devices[i].factoryId.toString()
                ).name,
              });
            }
          }
        }

        // Send the paid order to the webservice so that it can be sent to the sales backend
        const newDevicesOrder = {
          clientName: client.name,
          devices: orderDevices,
        };
        const uploadDevicesToWebServer = await axios.post(
          `http://${LOCALHOST_IP}:${WEBSERVICES_PORT}/?paidOrder=true`,
          newDevicesOrder
        );

        if (uploadDevicesToWebServer.data.success) {
          try {
            await order.save();
            res.status(200).send({
              success: true,
              message: "The order has been paid.",
              newOrderData: order,
            });
          } catch (error) {
            res.status(500).send({
              success: false,
              message: `Error updating the order: ${error}`,
            });
          }
        } else {
          res.status(500).send({
            success: false,
            message: `Error uploading the order to the webservice: ${uploadDevicesToWebServer.data.message}`,
          });
        }
      } catch (error) {
        res.status(500).send({
          success: false,
          message: `Error updating data from ${existingSchemas[3]}: ${error}`,
        });
      }
    } else {
      res.status(400).send({
        success: false,
        message: "Incorrect parameters.",
      });
    }
  } else {
    res.status(400).send({
      success: false,
      message: "Please provide a valid parameter.",
    });
  }
});

router.put("/:schema/:name", async (req, res) => {
  const schemaName = req.params.schema;
  const name = req.params.name;

  // Check if the schema exists
  if (!schemaExists(schemaName)) {
    // Schema does not exist
    if (schemaName === undefined) {
      res.status(400).send({
        success: false,
        message: "Please provide the schema parameter.",
      });
    } else {
      res.status(400).send({
        success: false,
        message: `The schema '${schemaName}' does not exist.`,
      });
    }
  } else {
    const schema = schemas[schemaName].schema;

    try {
      // Check if the document with the given name exists
      const nameField = schemas[schemaName].nameField;
      const existingDocument = await schema.findOne({ [nameField]: name });

      if (existingDocument !== null) {
        // Update the document
        const updatedDocument = await schema.findOneAndUpdate(
          { [nameField]: name },
          req.body,
          { new: true }
        );

        res.status(200).send({
          success: true,
          data: updatedDocument,
        });
      } else {
        res.status(404).send({
          success: false,
          message: `The document with name '${name}' does not exist.`,
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: `Error updating data from ${schemaName}: ${error}`,
      });
    }
  }
});

// ================================== Delete ==================================
router.delete("/", async (req, res) => {
  const params = req.query;
  const paramsNumber = Object.keys(params).length;

  if (paramsNumber === 0) {
    res.status(400).send({
      success: false,
      message: "Please provide the name of the schema as a parameter.",
    });
  } else {
    if (params.deviceId !== undefined) {
      // Attempt to delete the device with the given id
      try {
        const deviceDelete = await schemas.devices.schema.findOneAndDelete({
          _id: params.deviceId,
        });

        if (deviceDelete !== null) {
          res.status(200).send({
            success: true,
            message: `The device with id '${params.deviceId}' has been deleted.`,
          });
        } else {
          res.status(404).send({
            success: false,
            message: `The device with id '${params.deviceId}' does not exist.`,
          });
        }
      } catch (error) {
        res.status(500).send({
          success: false,
          message: `Error deleting data from devices: ${error}`,
        });
      }
    } else {
      res.status(400).send({
        success: false,
        message: "Please provide a valid parameter.",
      });
    }
  }
});

router.delete("/:schema/:name", async (req, res) => {
  const schemaName = req.params.schema;
  const name = req.params.name;

  // Check if the schema exists
  if (!schemaExists(schemaName)) {
    // Schema does not exist
    if (schemaName === undefined) {
      res.status(400).send({
        success: false,
        message: "Please provide the schema parameter.",
      });
    } else {
      res.status(400).send({
        success: false,
        message: `The schema '${schemaName}' does not exist.`,
      });
    }
  } else {
    const schema = schemas[schemaName].schema;
    const nameField = schemas[schemaName].nameField;

    // Try to delete the document
    try {
      const data = await schema.findOneAndDelete({ [nameField]: name });

      if (data !== null) {
        res.status(200).send({
          success: true,
          message: `The document with name '${name}' has been successfully deleted.`,
          dataDeleted: data,
        });
      } else {
        res.status(404).send({
          success: false,
          message: `The document with name '${name}' does not exist.`,
        });
      }
    } catch (error) {
      res.status(500).send({
        success: false,
        message: `Error deleting data from ${schemaName}: ${error}`,
      });
    }
  }
});

module.exports = router;
