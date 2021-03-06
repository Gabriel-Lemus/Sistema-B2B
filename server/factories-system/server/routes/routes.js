const express = require("express");
const axios = require("axios");
const router = express.Router();
const Excel = require("exceljs");
const nodemailer = require("nodemailer");

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
    const paramsNumber = Object.keys(req.params).length;

    if (
      paramsNumber === 0 ||
      (paramsNumber === 1 && schemaName === existingSchemas[0])
    ) {
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

            // Check if the schema is the factories schema
            if (schemaName === existingSchemas[0]) {
              // Get the new factory's id
              const factoryId = newDocument._id;

              // Add the default shipping times to every client document in the clients collection
              const clients = await schemas[existingSchemas[2]].schema.find();

              // Iterate through the clients
              for (let i = 0; i < clients.length; i++) {
                const client = clients[i];
                client.shippingTimes.push({
                  factoryId: factoryId,
                  shippingTime: 0,
                });
              }

              // Update the clients documents if there are any
              if (clients.length > 0) {
                await schemas[existingSchemas[2]].schema.updateMany(
                  {},
                  { $set: { shippingTimes: clients[0].shippingTimes } }
                );
              }
            }

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
    } else if (
      paramsNumber === 1 &&
      req.query.newOrderNoClientId === undefined &&
      req.query.newOrder === undefined &&
      req.query.newClientOrder === undefined &&
      req.query.sendSalesReport === undefined
    ) {
      // Attempt to insert a new document into the specified collection/schema
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
          error: `Error inserting into ${schemaName}: ${error}`,
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

        // Get the id for the new order
        const newOrderId = await schemas[schemaName].schema.find().sort({
          _id: -1,
        });
        const idForNewOrder =
          newOrderId.length === 0 ? 1 : newOrderId[0]._id + 1;

        // Try to create the new document for the order
        try {
          const newOrderDocument = new schemas[schemaName].schema({
            _id: idForNewOrder,
            ...order,
          });
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
      } else if (
        params.newOrderNoClientId !== undefined &&
        schemaName === existingSchemas[3]
      ) {
        let order = req.body;
        let maxDeliveryDate = null;
        const clientName = order.clientId;

        // Get the client's id based on their name
        order.clientId = await schemas[existingSchemas[2]].schema
          .findOne({
            name: clientName,
          })
          .select("_id");

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
      } else if (params.newClientOrder !== undefined) {
        // Register a new order for the sellers that come from a client
        const order = req.body;
        let maxOrderDeliveryDate = new Date();
        let devicesDeliveryDates = [];
        let estimatedDeliveryDateRounded;

        // Get the client's id based on their name
        const clientId = await schemas[existingSchemas[2]].schema
          .findOne({
            name: order[0].sellerName,
          })
          .select("_id");

        // Get the client's shipping times
        const clientShippingTimes = await schemas[existingSchemas[2]].schema
          .findOne({
            _id: clientId._id,
          })
          .select("shippingTimes");

        // Iterate through the devices in the order
        for (let i = 0; i < order.length; i++) {
          // Get the device's shipping time
          const deviceShippingTimeDays = await schemas[
            existingSchemas[1]
          ].schema
            .findOne({
              _id: order[i].deviceId,
            })
            .select("shipping_time");

          // Find the client's shipping time in the clientShippingTimes array where the factoryId matches the device's factoryId
          const clientShippingTimeDays = clientShippingTimes.shippingTimes.find(
            (shippingTime) =>
              shippingTime.factoryId.toString() === order[i].factoryId
          ).shippingTime;

          // The estimated delivery date is the device's shipping time in days plus the client's shipping time in days for the given factory
          const estimatedDeliveryDateDays =
            deviceShippingTimeDays.shipping_time + clientShippingTimeDays;
          const estimatedDeliveryDate = new Date(
            new Date().getTime() +
              estimatedDeliveryDateDays * 24 * 60 * 60 * 1000
          );

          // Round the estimated delivery date
          estimatedDeliveryDateRounded = new Date(
            estimatedDeliveryDate.getTime() +
              24 * 60 * 60 * 1000 -
              (estimatedDeliveryDate.getTime() % (24 * 60 * 60 * 1000))
          );

          if (estimatedDeliveryDate > maxOrderDeliveryDate) {
            maxOrderDeliveryDate = estimatedDeliveryDateRounded;
          }

          devicesDeliveryDates.push(estimatedDeliveryDateRounded);
        }

        // Get the id for the new order
        const newOrderId = await schemas[schemaName].schema
          .find()
          .sort({
            _id: -1,
          })
          .limit(1)
          .select("_id");
        const idForNewOrder =
          newOrderId.length === 0 ? 1 : newOrderId[0]._id + 1;

        // Create a new document for the order
        const newOrderDocument = new schemas[schemaName].schema({
          _id: idForNewOrder,
          clientId: clientId._id,
          completed: false,
          maxDeliveryDate: estimatedDeliveryDateRounded,
          isClientOrder: true,
          canceled: false,
          devices: order.map((device, idx) => ({
            deviceId: device.deviceId,
            factoryId: device.factoryId,
            quantity: device.quantity,
            price: device.price,
            estimatedDeliveryDate: devicesDeliveryDates[idx],
            delivered: false,
            payed: false,
            deliveredDate: null,
            canBeDisplayed: false,
            displayed: false,
          })),
        });

        // Try to create the new document for the order
        try {
          await newOrderDocument.save();
          res.status(201).send({
            success: true,
            message: "The new order was created successfully.",
            maxDeliveryDate: maxOrderDeliveryDate,
            orderId: idForNewOrder,
            estimatedDeliveryDates: devicesDeliveryDates,
          });
        } catch (error) {
          return res.status(500).send({
            success: false,
            error: `Error creating creating the new order: ${error}`,
          });
        }
      } else if (params.sendSalesReport !== undefined) {
        const recipient = params.sendSalesReport;
        const payload = req.body;
        const items = payload.items;
        const total = payload.total;
        const title = payload.title;

        let workbook = new Excel.Workbook();
        let worksheet = workbook.addWorksheet("Reporte de Ventas");

        worksheet.columns = [
          { header: "Nombre", key: "name" },
          { header: "Descripci??n", key: "description" },
          { header: "Categor??a", key: "category" },
          { header: "Color", key: "color" },
          { header: "C??digo de Modelo", key: "model_code" },
          { header: "Tiempo de Garant??a", key: "warranty_time" },
          { header: "Cantidad", key: "quantity" },
          { header: "Precio", key: "price" },
        ];

        items.forEach((item) => {
          worksheet.addRow(item);
        });

        worksheet.addRow({
          name: "",
          description: "",
          category: "",
          color: "",
          model_code: "",
          warranty_time: "",
          quantity: "Total",
          price: total,
        });

        const buffer = await workbook.xlsx.writeBuffer();

        const sender = process.env.EMAIL_SENDER;
        const password = process.env.EMAIL_PASSWORD;
        const transporter = nodemailer.createTransport({
          service: "gmail",
          host: "smtp.gmail.com",
          port: 587,
          secure: true,
          auth: {
            user: sender,
            pass: password,
          },
        });
        const mailOptions = {
          from: "Sistema B2B <" + sender + ">",
          to: recipient,
          subject: title,
          html: `<div class="container" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; width: 85%; background-color: #bfe6ff; font-family: "Helvetica Neue",Helvetica,Arial,sans-serif; font-size: 14px; line-height: 1.42857143; color: #333">
          <div class="card" style="position: relative; display: -webkit-box; display: -ms-flexbox; display: flex; -webkit-box-orient: vertical; -webkit-box-direction: normal; -ms-flex-direction: column; flex-direction: column; min-width: 0; word-wrap: break-word; background-color: #bfe6ff; background-clip: border-box; border: 1px solid rgba(0,0,0,.125); border-radius: 0.25rem">
            <div class="card-body" style="-webkit-box-flex: 1; -ms-flex: 1 1 auto; flex: 1 1 auto; padding: 1.25rem">
              <h3 class="card-title" style="margin-bottom: 0.75rem">Reporte de Ventas</h3>
              <p class="card-text" style="display: -webkit-box; margin-bottom: 1rem; margin-top: 0">Ha recibido este correo porque se ha sido solicitado enviar el reporte de ventas a este correo electr??nico.</p>
            </div>
          </div>
        </div>`,
          attachments: [
            {
              filename: `${title}.xlsx`,
              content: buffer,
              contentType:
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
          ],
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res.status(500).send({
              success: false,
              error: `Error sending the sales report: ${error}`,
            });
          } else {
            res.status(201).send({
              success: true,
              message: "Sales report sent successfully.",
            });
          }
        });
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
        params.clientOrdersNoClientId !== undefined &&
        schemaName === existingSchemas[3]
      ) {
        let clientId = params.clientOrdersNoClientId;
        const deliveredOrders = [];
        const pendingOrders = [];
        const cancelledOrders = [];

        // Get the client's id based on the name
        try {
          clientId = await schemas.clients.schema.findOne({
            name: clientId,
          });
          clientId = clientId._id.toString();
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error getting data from ${schemaName}: ${error}`,
          });
        }

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
                  !allOrders[i].canceled &&
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
      } else if (
        params.generalizedDeviceSearch !== undefined &&
        schemaName === existingSchemas[1]
      ) {
        // Return all the devices that match the search query in any field
        const searchQuery = params.generalizedDeviceSearch;

        try {
          // The regex will test if the search query is contained in any of the fields.
          // Anything can go before or after the search query.
          const searchQueryRegex = new RegExp(`.*${searchQuery}.*`, "i");
          let searchQueryIsNumeric = false;
          let devices;

          // Check if the search query is a number
          if (!isNaN(searchQuery)) {
            searchQueryIsNumeric = true;
          }

          if (!searchQueryIsNumeric) {
            // Get the devices that match the search query
            devices = await schemas.devices.schema.find({
              $or: [
                { name: searchQueryRegex },
                { description: searchQueryRegex },
                { model_code: searchQueryRegex },
                { color: searchQueryRegex },
                { category: searchQueryRegex },
              ],
            });
          } else {
            // Get the devices that match the search query
            devices = await schemas.devices.schema.find({
              $or: [{ price: searchQuery }, { warranty_time: searchQuery }],
            });
          }

          res.status(200).send({
            success: true,
            devices,
          });
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error getting data from ${schemaName}: ${error}`,
          });
        }
      } else if (
        params.specializedDeviceSearch !== undefined &&
        schemaName === existingSchemas[1]
      ) {
        let searchParams = req.body.searchParams;
        let searchQueries = [];

        // If searchParams is empty, look for the params in the query
        if (
          searchParams === undefined ||
          searchParams === null ||
          Object.keys(searchParams).length === 0
        ) {
          searchParams = req.query;
        }

        // Iterate through the device's schema fields and check if the searchParams contain them and add them to the searchQueries array
        for (let i = 0; i < schemas[existingSchemas[1]].fields.length; i++) {
          // Iterate through the keys of the searchParams object
          for (const key in searchParams) {
            // Check if the key is the same as the field's name
            if (key === schemas[existingSchemas[1]].fields[i]) {
              // Check if the field is a number
              if (schemas[existingSchemas[1]].fields[i].type === "number") {
                // Check if the value is a number
                if (!isNaN(searchParams[key])) {
                  // Add the search query to the array
                  searchQueries.push({
                    [key]: searchParams[key],
                  });
                }
              } else {
                // Add the search query to the array
                searchQueries.push({
                  [key]: new RegExp(`.*${searchParams[key]}.*`, "i"),
                });
              }
            }
          }
        }

        // Return all the devices that match all the search parameters
        try {
          const devices = await schemas.devices.schema.find({
            $and: searchQueries,
          });

          res.status(200).send({
            success: true,
            devices,
          });
        } catch (error) {
          res.status(500).send({
            success: false,
            message: `Error getting data from ${schemaName}: ${error}`,
          });
        }
      } else if (
        params.lastReportedSales !== undefined &&
        schemaName === existingSchemas[3]
      ) {
        // Get the last reported sales for the factory since the last time they were reviewed
        const factoryId = params.lastReportedSales;
        const currentDate = new Date();

        // Aggregate the orders collection to get the devices in the orders that belong to the factory, can be displayed and haven't been displayed yet
        const orders = await schemas.orders.schema.aggregate([
          {
            $match: {
              $and: [
                { completed: true },
                { canceled: false },
                { "devices.lastReported": null },
              ],
            },
          },
        ]);

        // Aggregate the orders collection to get the devices in the orders that belong to the factory, can be displayed and haven't been displayed yet
        const reportedOrders = await schemas.orders.schema.aggregate([
          {
            $match: {
              $and: [{ completed: true }, { canceled: false }],
            },
          },
        ]);

        // Record the last time the factory's devices were reviewed by finding the order with a lastReported attribute within a
        // device in the devices array that has the most recent value. Null if there have been no reported devices.
        let lastReported = null;

        // Iterate through the reported orders
        for (let i = 0; i < reportedOrders.length; i++) {
          // Iterate through the devices in the order
          for (let j = 0; j < reportedOrders[i].devices.length; j++) {
            // Check if the device belongs to the factory
            if (
              reportedOrders[i].devices[j].factoryId.toString() === factoryId
            ) {
              if (
                (reportedOrders[i].devices[j].lastReported !== undefined &&
                  new Date(reportedOrders[i].devices[j].lastReported) >
                    lastReported &&
                  lastReported !== null) ||
                (lastReported === null &&
                  reportedOrders[i].devices[j].lastReported !== undefined)
              ) {
                lastReported = new Date(
                  reportedOrders[i].devices[j].lastReported
                );
              }
            }
          }
        }

        // For every device in each order, filter those devices that belong to the factory
        nonReportedDevices = orders.map((order) =>
          order.devices.filter(
            (device) => device.factoryId.toString() === factoryId
          )
        );

        // Filter the devices that have the lastReported field set to null
        nonReportedDevices = nonReportedDevices.map((order) =>
          order.filter(
            (device) =>
              device.lastReported === null || device.lastReported === undefined
          )
        );

        // If nonReportedDevices is has any empty arrays, remove them
        nonReportedDevices = nonReportedDevices.filter(
          (order) => order.length !== 0
        );

        // Flatten the array of arrays
        nonReportedDevices = [].concat.apply([], nonReportedDevices);

        // There may be repeated devices, iterate through the array and remove the duplicates, while incrementing the quantity of the existing device
        for (let i = 0; i < nonReportedDevices.length; i++) {
          for (let j = i + 1; j < nonReportedDevices.length; j++) {
            if (
              nonReportedDevices[i].deviceId.toString() ===
              nonReportedDevices[j].deviceId.toString()
            ) {
              nonReportedDevices[i].quantity += nonReportedDevices[j].quantity;
              nonReportedDevices.splice(j, 1);
              j--;
            }
          }
        }

        // Get an array of the devices' ids
        const deviceIds = nonReportedDevices.map((device) =>
          device.deviceId.toString()
        );

        // Get the data of every device that hasn't been reported yet
        const devices = await schemas.devices.schema.find(
          { _id: { $in: deviceIds } },
          {
            _id: 1,
            name: 1,
            description: 1,
            price: 1,
            model_code: 1,
            color: 1,
            category: 1,
            warranty_time: 1,
          }
        );
        const devicesData = devices.map((device) => ({
          ...device._doc,
        }));

        // Add the quantities to the devices
        for (let i = 0; i < nonReportedDevices.length; i++) {
          for (let j = 0; j < devicesData.length; j++) {
            if (
              nonReportedDevices[i].deviceId.toString() ===
              devicesData[j]._id.toString()
            ) {
              devicesData[j].quantity = nonReportedDevices[i].quantity;
              break;
            }
          }
        }

        // Set the orders that have devices that belong to the factory and set the lastReported field to now, the displayed field to true and the canBeDisplayed field to false
        for (let i = 0; i < orders.length; i++) {
          for (let j = 0; j < orders[i].devices.length; j++) {
            if (orders[i].devices[j].factoryId.toString() === factoryId) {
              orders[i].devices[j].lastReported = new Date(
                new Date(
                  currentDate.getTime() - 6 * 60 * 60 * 1000
                ).toISOString()
              );
              orders[i].devices[j].displayed = true;
              orders[i].devices[j].canBeDisplayed = false;
            }
          }
        }

        let updatedOrdersCount = 0;

        // Iterate through the orders and update them
        for (let i = 0; i < orders.length; i++) {
          try {
            const updatedOrder = await schemas.orders.schema.findOneAndUpdate(
              { _id: orders[i]._id },
              { $set: { devices: orders[i].devices } },
              { new: true }
            );
            updatedOrdersCount++;
          } catch (error) {
            res.status(500).send({
              success: false,
              message: `Error updating order: ${error}`,
            });
          }
        }

        if (updatedOrdersCount === orders.length) {
          res.status(200).send({
            success: true,
            devicesCount: devicesData.length,
            nonReportedDevices: devicesData,
            lastReported,
          });
        } else {
          res.status(500).send({
            success: false,
            message: `Error updating orders`,
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
        const order = orders[i];
        const orderId = order._id;
        const orderSchema = schemas[existingSchemas[3]].schema;

        // Reduce the devices to check if all of their quantities have been set to 0
        const itemsCount = order.devices.reduce((acc, cur) => {
          return acc + cur.quantity;
        }, 0);

        // If the items count is 0, cancel the order
        if (itemsCount === 0) {
          try {
            const orderData = await orderSchema.findOneAndUpdate(
              { _id: orderId },
              {
                $set: {
                  canceled: true,
                },
              }
            );

            if (orderData !== null) {
              changedOrders.push(orderData);

              // Attempt to save the order
              try {
                await orderData.save();
              } catch (error) {
                res.status(500).send({
                  success: false,
                  message: `Error saving the order: ${error}`,
                });
              }
            }
          } catch (error) {
            res.status(500).send({
              success: false,
              message: `Error updating data from ${existingSchemas[3]}: ${error}`,
            });
          }
        } else {
          // Filter the devices and get those with a quantity greater than 0
          const newDevices = order.devices.filter(
            (device) => device.quantity > 0
          );

          // Get the maximum max delivery date casted as a date
          const maxDeliveryDate = newDevices.reduce(
            (acc, cur) =>
              acc > new Date(cur.estimatedDeliveryDate)
                ? acc
                : new Date(cur.estimatedDeliveryDate),
            new Date(0)
          );

          // Find the order by its id and update it
          try {
            const orderData = await orderSchema.findOneAndUpdate(
              { _id: orderId },
              { $set: { devices: newDevices, maxDeliveryDate } },
              { new: true }
            );

            if (orderData !== null) {
              changedOrders.push(orderData);

              // Attempt to save the order
              try {
                await orderData.save();
              } catch (error) {
                res.status(500).send({
                  success: false,
                  message: `Error saving the order: ${error}`,
                });
              }
            }
          } catch (error) {
            res.status(500).send({
              success: false,
              message: `Error updating data from ${existingSchemas[3]}: ${error}`,
            });
          }
        }
      }

      // If all the orders have been updated, send success message
      if (changedOrders.length === orders.length) {
        res.status(200).send({
          success: true,
          message: "The orders have been updated.",
          changedOrders,
        });
      } else {
        res.status(500).send({
          success: false,
          message: "An error occurred while updating the orders.",
        });
      }
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
              break;
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
    } else if (params.payClientOrder) {
      const orderId = params.payClientOrder;

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
                deviceId: order.devices[i].deviceId.toString(),
                estimatedDeliveryDate:
                  order.devices[i].estimatedDeliveryDate.toISOString(),
              });
              break;
            }
          }
        }

        // Send the paid order to the webservice so that it can be sent to the sales backend as a delivery order
        const newDevicesOrder = {
          clientName: client.name,
          orderId: Number(order._id.toString()),
          estimatedDeliveryDate: orderDevices[0].estimatedDeliveryDate,
        };
        const sendDevicesToStore = await axios.put(
          `http://${LOCALHOST_IP}:${WEBSERVICES_PORT}/?payClientOrder=true`,
          newDevicesOrder
        );

        if (sendDevicesToStore.data.success) {
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
            message: `Error uploading the order to the webservice: ${sendDevicesToStore.data.message}`,
          });
        }
      } catch (error) {
        res.status(500).send({
          success: false,
          message: `Error updating data from ${existingSchemas[3]}: ${error}`,
        });
      }
    } else if (params.updateClientOrder) {
      // Update the order made by the client
      const orders = req.body;
      let updatedOrders = 0;

      // Iterate through the orders and update them
      for (let i = 0; i < orders.length; i++) {
        // Check if all of the devices in the order were cancelled
        let cancelledDevices = 0;
        let orderId = orders[i][0].id_pedido;

        for (let j = 0; j < orders[i].length; j++) {
          if (orders[i][j].toDelete) {
            cancelledDevices++;
          }
        }

        // If all of the devices were cancelled, the order is cancelled
        if (cancelledDevices === orders[i].length) {
          // Cancel the order
          try {
            const updatedOrder = await schemas[
              existingSchemas[3]
            ].schema.findOneAndUpdate(
              { _id: orderId },
              {
                $set: {
                  canceled: true,
                },
              }
            );

            if (updatedOrder) {
              updatedOrders++;
            }
          } catch (error) {
            res.status(500).send({
              success: false,
              message: `Error updating data from ${existingSchemas[3]}: ${error}`,
            });
          }
        } else {
          // Update the order
          let previousOrderDevices = [];
          let newOrderDevices = [];

          // Get the order given its id
          const order = await schemas[existingSchemas[3]].schema.findOne({
            _id: orderId,
          });
          previousOrderDevices = order.devices;

          // Update the devices in the order
          for (let j = 0; j < orders[i].length; j++) {
            // Add the device with the new quantity to the order if it was not cancelled
            if (!orders[i][j].toDelete) {
              newOrderDevices.push({
                ...previousOrderDevices
                  .toObject()
                  .find(
                    (device) =>
                      device.deviceId.toString() ===
                      orders[i][j].id_dispositivo.toString()
                  ),
                quantity: orders[i][j].cantidad_dispositivos,
              });
            }
          }

          // Update the order
          try {
            const updatedOrder = await schemas[
              existingSchemas[3]
            ].schema.findOneAndUpdate(
              { _id: orderId },
              {
                $set: {
                  devices: newOrderDevices,
                },
              }
            );

            if (updatedOrder) {
              updatedOrders++;
            }
          } catch (error) {
            res.status(500).send({
              success: false,
              message: `Error updating data from ${existingSchemas[3]}: ${error}`,
            });
          }
        }
      }

      // Check if all the orders were updated
      if (updatedOrders === orders.length) {
        res.status(200).send({
          success: true,
          message: "The orders were successfully updated.",
        });
      } else {
        res.status(500).send({
          success: false,
          message: `Error updating the orders. Only ${updatedOrders} of ${orders.length} were updated.`,
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
