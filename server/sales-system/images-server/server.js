const express = require("express");
const multer = require("multer");
const app = express();
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
    if (!fileName) {
      date = Date.now();
      fileName = date + "-" + file.originalname;
    }
    cb(null, fileName);
  },
});

// Multer configuration
const uploadProductImage = multer({ storage: productImageStorage });
const uploadCommercePatent = multer({ storage: commercePatentStorage });

// Routes
app.get("/upload", (req, res) => {
  res.render("upload");
});

app.post(
  "/upload-product-image",
  uploadProductImage.single("product-image"),
  (req, res) => {
    res.send({
      success: true,
      imgURL: `http://localhost:3001/images/product-images/${date}-${req.file.originalname}`,
      message: "Image uploaded successfully",
    });
  }
);

app.post(
  "/upload-commerce-patent",
  uploadCommercePatent.single("commerce-patent"),
  (req, res) => {
    res.send({
      success: true,
      imgURL: `http://localhost:3001/images/commerce-patents/${date}-${req.file.originalname}`,
      message: "Image uploaded successfully",
    });
  }
);

// Listen on port 3001
app.listen(3001, () => {
  console.log("Server is running on port 3001");
});
