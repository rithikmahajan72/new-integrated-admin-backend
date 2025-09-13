// Test script to verify the commonSizeChart validation fix
const mongoose = require("mongoose");
const Item = require("./src/models/Item");

// Connect to database
require("dotenv").config();
const { connectToDB } = require("./src/database/db");

async function testValidationFix() {
  try {
    await connectToDB();
    console.log("Connected to database");

    // Test data that was causing the validation error
    const testItemData = {
      productId: `TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      // This was causing the validation error before the fix
      commonSizeChart: {
        cmChart: '',
        inchChart: '',
        measurementGuide: ''
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
        },
        myntra: {
          enabled: false,
          price: 999,
          salePrice: 899
        },
        amazon: {
          enabled: false,
          price: 999,
          salePrice: 899
        },
        flipkart: {
          enabled: false,
          price: 999,
          salePrice: 899
        },
        nykaa: {
          enabled: false,
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

    console.log("Creating test item with fixed validation...");
    const testItem = new Item(testItemData);
    await testItem.save();
    console.log("✅ SUCCESS: Item created successfully without validation errors!");
    console.log("Item ID:", testItem._id);

    // Clean up - delete the test item
    await Item.findByIdAndDelete(testItem._id);
    console.log("Test item cleaned up");

    process.exit(0);
  } catch (error) {
    console.error("❌ VALIDATION ERROR:", error.message);
    if (error.errors) {
      console.log("Detailed errors:");
      Object.keys(error.errors).forEach(key => {
        console.log(`- ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
}

testValidationFix();
