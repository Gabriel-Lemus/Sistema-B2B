require("dotenv").config();

const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
let date;

// Make the images folder accessible to the server
app.use("/images", express.static(__dirname + "/images"));
app.set("view engine", "ejs");

// Multer storage configuration
const productImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/product-images");
  },
  filename: (req, file, cb) => {
    let fileName = req.body.fileName;
    if (!fileName) {
      date = Date.now();
      fileName = date + "-" + file.originalname;
    }
    cb(null, fileName);
  },
});

const commercePatentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images/commerce-patents");
  },
  filename: (req, file, cb) => {
    let fileName = req.body.fileName;
    date = Date.now();
    if (!fileName) {
      fileName = date + "-" + file.originalname;
    }
    cb(null, fileName);
  },
});

// Multer configuration
const uploadProductImage = multer({ storage: productImageStorage });
const uploadCommercePatent = multer({ storage: commercePatentStorage });

// ================================= Routes =================================
// Test get
app.get("/upload", (req, res) => {
  res.render("upload");
});

// Post product image
app.post(
  "/upload-product-image",
  uploadProductImage.single("product-image"),
  (req, res) => {
    res.send({
      success: true,
      imgURL: `http://${process.env.PUBLIC_IP}:3001/images/product-images/${
        req.body.fileName !== undefined
          ? req.body.fileName
          : date + "-" + req.file.originalname
      }`,
      message: "Image uploaded successfully",
    });
  }
);

// Post commerce patent
app.post(
  "/upload-commerce-patent",
  uploadCommercePatent.single("commerce-patent"),
  (req, res) => {
    res.send({
      success: true,
      imgURL: `http://${process.env.PUBLIC_IP}:3001/images/commerce-patents/${
        req.body.fileName !== undefined
          ? req.body.fileName
          : date + "-" + req.file.originalname
      }`,
      message: "Image uploaded successfully",
    });
  }
);

// Delete old commerce patent images
app.delete("/delete-commerce-patent/:fileName", (req, res) => {
  try {
    fs.unlinkSync(`./images/commerce-patents/${req.params.fileName}`);
    res.send({
      success: true,
      message: "Commerce patent image deleted successfully",
    });
  } catch (error) {
    if (error.code === "ENOENT") {
      res.send({
        success: false,
        message: "Commerce patent image not found",
      });
    } else {
      res.send({
        success: false,
        message: "Error deleting commerce patent image",
      });
    }
  }
});

// Listen on port 3001
app.listen(3001, () => {
  console.log("Running on http://localhost:3001");
});
