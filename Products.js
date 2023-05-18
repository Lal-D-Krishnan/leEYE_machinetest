import mongoose from "mongoose";


// Define the schema for the product collection
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    MRP: { type: Number, required: true },
    discount: { type: Number, required: true },
    shippingCharge: { type: Number, required: true },
    images: [{ type: String, required: true }]
  });
  
  // Create the product model
export  const Product = mongoose.model('Product', productSchema);

