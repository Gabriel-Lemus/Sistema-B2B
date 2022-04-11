const express = require("express");
const router = express.Router();

// Existing schemas
const existingSchemas = ["factory"];
const schemas = {
  factory: {
    schema: require("../models/factories"),
    fields: ["name", "email", "salt", "hash"],
    nonRepeatingFields: ["name", "email"],
    nameField: "name",
  },
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
        schemaName === "factory"
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
      } else if (params.emailExists !== undefined && schemaName === "factory") {
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
router.put("/", (req, res) => {
  res.status(400).send({
    success: false,
    message: "Please provide the name of the schema as a parameter.",
  });
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
  res.status(400).send({
    success: false,
    message: "Please provide the name of the schema as a parameter.",
  });
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
