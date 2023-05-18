import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import path from "path";
import fs from "fs";
import multer from "multer";
import { Product } from "./Products.js";

const app = express();
const port = process.env.PORT || 3000;

// app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect("mongodb://0.0.0.0:27017/leETYE").catch((error) => {
  console.log(error.message);
});

// Check if the "uploads" folder exists, and create it if it doesn't
const uploadsFolderPath = "./uploads";
if (!fs.existsSync(uploadsFolderPath)) {
  fs.mkdirSync(uploadsFolderPath);
}

// Configure Multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save uploaded files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // Use a unique name for each file
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.send("Server Expresso ☕");
});

// API routes

// Create a new product //ADD
app.post("/addproduct", upload.array("images"), async (req, res) => {
  try {
    const found = await Product.findOne({
      name: { $regex: req.body.name, $options: "i" },
    });
    if (found) {
      console.log(found);
      console.log(found.name);
      return res.status(500).json({ message: `${found}, already exist` });
    }

    const { name, description, MRP, discount, shippingCharge } = req.body;
    const images = req.files.map((file) => file.path);

    if (
      !name ||
      !description ||
      !MRP ||
      !discount ||
      !shippingCharge ||
      images.length === 0
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields or images" });
    }

    if (MRP < 1000)
      return res
        .status(500)
        .json({ message: "MRP should be greater than 1000" });
    if (discount > 5)
      return res
        .status(500)
        .json({ message: "discount cannot be greater than 5" });
    if (shippingCharge > 500)
      return res
        .status(500)
        .json({ message: "shipping charge cannot be greater than 500" });

    const totalPrice = Math.floor(MRP - discount / 100 + shippingCharge); // do error checking here

    if (totalPrice <= 0) {
      return res
        .status(500)
        .json({ message: "Enter valid MRP, discount or shipping charge" });
    }
    const newProduct = new Product({
      name,
      description,
      MRP,
      discount,
      shippingCharge,
      images,
    });

    const newProd = await newProduct.save();
    console.log("Product added successfully", newProd);
    res.status(201).json({ message: "Product created successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Get all products // GET
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Update a product // EDIT / UPDATE
app.put("/product/:id", upload.array("images"), async (req, res) => {
  try {
    const found = await Product.findOne({
      name: { $regex: req.body.name, $options: "i" },
    });
    if (found) {
      console.log(found);
      console.log(found.name);
      return res.status(500).json({ message: `${found}, already exist` });
    }

    const { name, description, MRP, discount, shippingCharge } = req.body;
    const images = req.files.map((file) => file.path);

    if (!name || !description || !MRP || !discount || !shippingCharge || images.length === 0) {
        return res.status(400).json({ error: 'Missing required fields or images' });
      }

    if (MRP < 1000)
      return res
        .status(500)
        .json({ message: "MRP should be greater than 1000" });
    if (discount > 5)
      return res
        .status(500)
        .json({ message: "discount is in %, it cannot be greater than 5" });
    if (shippingCharge > 500)
      return res
        .status(500)
        .json({ message: "shipping charge cannot be greater than 500" });

    const totalPrice = Math.floor(MRP - discount / 100 + shippingCharge); // do error checking here

    if (totalPrice <= 0) {
      return res
        .status(500)
        .json({ message: "Enter valid MRP, discount or shipping charge" });
    }

    const updatedProd = await Product.findByIdAndUpdate(req.params.id, {
      name,
      description,
      MRP,
      discount,
      shippingCharge,
      images,
    });
    console.log("'Product updated successfully'", updatedProd);
    res.status(201).json({ product: updatedProd,message: "Product updated successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: err.message });
  }
});

// Delete a product // DELETE
app.delete("/product/:id", async (req, res) => {
  try {
    console.log("route was hit");
    const product = await Product.findByIdAndDelete(req.params.id);
    console.log("Product deleted successfully");
    console.log(product, "this product was deleted");
    res.status(204).json({message: "product deleted successfully"})
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: err.message,
    message: "no such product exist" });
  }
});

// Handle errors
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

app.listen(port, () =>
  console.log(`Expresso ☕ is on Port ${port} Ctrl + C to Stop `)
);
