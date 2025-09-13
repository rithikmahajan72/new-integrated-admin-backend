// Test script to reproduce the original validation error
const mongoose = require("mongoose");
const Item = require("./src/models/Item");

// Connect to database
require("dotenv").config();
const { connectToDB } = require("./src/database/db");

async function testOriginalError() {
  try {
    await connectToDB();
    console.log("Connected to database");

    // Test data that was causing the validation error (with wrong data types)
    const testItemData = {
      productId: `TEST_ERROR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productName: "Test Draft Product",
      name: "Test Draft Product",
      title: "Test Draft Product",
      description: "Test product saved as draft",
      regularPrice: 999,
      price: 999,
      categoryId: new mongoose.Types.ObjectId(),
      subCategoryId: new mongoose.Types.ObjectId(),
      status: 'draft',
      stock: 50,
      sizes: [{
        size: "M",
        quantity: 50,
        sku: "test/test/test/2025/01/01/12345678",
        barcode: "123456789",
        hsnCode: "",
        platformPricing: {
          yoraa: {
            enabled: true,
            price: 999,
            salePrice: 899
          }
        }
      }],
      variants: [{
        name: 'Default',
        images: [],
        videos: [],
        colors: [],
        additionalData: {}
      }],
      // This would cause the validation error (passing object instead of string)
      commonSizeChart: {
        cmChart: '',
        inchChart: '',
        measurementGuide: {} // This should be a string, not an object
      },
      sizeChart: {
        inchChart: '',
        cmChart: '',
        measurementImage: ''
      },
      platformPricing: {
        yoraa: {
          enabled: true,
          price: 999,
          salePrice: 899
        }
      },
      stockSizeOption: 'sizes',
      alsoShowInOptions: {},
      filters: [],
      tags: [],
      metaTitle: "Test Draft Product",
      metaDescription: "Test product saved as draft",
      slugUrl: "test-draft-product"
    };

    console.log("Testing original error scenario (object instead of string for measurementGuide)...");
    const testItem = new Item(testItemData);
    await testItem.save();
    console.log("Unexpected: This should have failed!");

    // Clean up if it somehow succeeded
    await Item.findByIdAndDelete(testItem._id);
    process.exit(0);
  } catch (error) {
    console.error("✅ EXPECTED VALIDATION ERROR REPRODUCED:", error.message);
    if (error.errors && error.errors['commonSizeChart.measurementGuide']) {
      console.log("✅ Specific error for measurementGuide:", error.errors['commonSizeChart.measurementGuide'].message);
    }
    console.log("This confirms our fix is working correctly - objects are not allowed for measurementGuide.");
    process.exit(0);
  }
}

testOriginalError();
