// Test script to verify the Product model commonSizeChart validation fix
const mongoose = require("mongoose");
const Product = require("./src/models/Product");

// Connect to database
require("dotenv").config();
const { connectToDB } = require("./src/database/db");

async function testProductValidationFix() {
  try {
    await connectToDB();
    console.log("Connected to database");

    // Test data that was causing the validation error
    const testProductData = {
      productId: `PROD_TEST_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productName: "Test Draft Product",
      title: "Test Draft Product",
      description: "Test product saved as draft",
      manufacturingDetails: "",
      shippingAndReturns: {
        shippingDetails: [],
        returnPolicy: [],
        additionalInfo: ""
      },
      regularPrice: 999,
      salePrice: 0,
      returnable: true,
      platformPricing: {
        yoraa: {
          enabled: true,
          price: 999,
          salePrice: 0
        }
      },
      categoryId: new mongoose.Types.ObjectId(),
      subCategoryId: new mongoose.Types.ObjectId(),
      stockSizeOption: 'sizes',
      sizes: [{
        size: "M",
        quantity: 50,
        hsnCode: "",
        sku: "test/test/test/2025/01/01/12345678",
        barcode: "123456789",
        platformPricing: {
          yoraa: {
            enabled: true,
            price: 999,
            salePrice: 0
          }
        }
      }],
      variants: [],
      alsoShowInOptions: {
        youMightAlsoLike: false,
        similarItems: false,
        othersAlsoBought: false,
        customOptions: [],
        appPlacements: {}
      },
      sizeChart: {
        cmChart: '',
        measurementImage: '',
        inchChart: ''
      },
      // This was causing the validation error before the fix
      commonSizeChart: {
        inchChart: '',
        measurementGuide: '',
        cmChart: '',
        attachedToVariants: [],
        globalChart: ''
      },
      metaTitle: "Test Draft Product",
      metaDescription: "Test product saved as draft",
      slugUrl: "test-draft-product",
      filters: [],
      productFilters: [],
      tags: [],
      additionalData: {},
      status: 'draft',
      publishingOptions: {
        action: 'draft',
        scheduledDate: null,
        scheduledTime: null,
        publishAt: null,
        autoPublish: false
      }
    };

    console.log("Creating test product with fixed validation...");
    const testProduct = new Product(testProductData);
    await testProduct.save();
    console.log("✅ SUCCESS: Product created successfully without validation errors!");
    console.log("Product ID:", testProduct._id);

    // Clean up - delete the test product
    await Product.findByIdAndDelete(testProduct._id);
    console.log("Test product cleaned up");

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

testProductValidationFix();
