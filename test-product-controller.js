// Test the Product controller's create function directly
const mongoose = require("mongoose");

// Connect to database
require("dotenv").config();
const { connectToDB } = require("./src/database/db");
const productController = require("./src/controllers/Product");

async function testProductControllerCreate() {
  try {
    await connectToDB();
    console.log("Connected to database");

    // Mock request and response objects
    const req = {
      body: {
        productName: "Test Draft Product",
        title: "Test Draft Product",
        description: "Test product saved as draft",
        status: "draft",
        categoryId: new mongoose.Types.ObjectId().toString(),
        subCategoryId: new mongoose.Types.ObjectId().toString(),
        regularPrice: 999,
        sizes: [{
          size: "M",
          quantity: 50,
          barcode: "123456789"
        }],
        // This is the problematic data structure that was causing validation errors
        commonSizeChart: {
          measurementGuide: {} // Object instead of string
        }
      }
    };

    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log("Response status:", this.statusCode);
        console.log("Response data:", JSON.stringify(data, null, 2));
        return this;
      }
    };

    console.log("Testing Product controller create with problematic data...");
    await productController.create(req, res);

  } catch (error) {
    console.error("Error in test:", error.message);
    process.exit(1);
  }
}

testProductControllerCreate();
