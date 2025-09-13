const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://localhost:8080/api';

// Test token (replace with valid token)
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGMzYzU0ZmFhZTA4ZDRlYTcxYTAyODgiLCJuYW1lIjoiQWRtaW4gVXNlciIsInBoTm8iOiI5ODc2NTQzMjEwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjpmYWxzZSwiaXNFbWFpbFZlcmlmaWVkIjpmYWxzZSwiaXNBZG1pbiI6dHJ1ZSwiaXNQcm9maWxlIjpmYWxzZSwiZW1haWwiOiJhZG1pbkB5b3JhYS5jb20iLCJwbGF0Zm9ybSI6bnVsbCwiX192IjowLCJpYXQiOjE3NTc2NjA1MzQsImV4cCI6MTc2MDI1MjUzNH0.JFac9CqhsadlHZX0_gtuyDNHWDzKBsEdiAo6QV5MxI4';

async function testProductCreationWithFixes() {
  console.log('🧪 Testing Product Creation with Fixes...\n');
  
  try {
    // Test product data with all the fixed fields
    const productData = {
      productName: "Test Product with Fixes",
      title: "Fixed Test Product",
      description: "Testing shipping returns, HSN codes, and size charts",
      manufacturingDetails: "Made with care",
      
      // Test shipping and returns structure
      shippingReturns: "Free shipping above ₹500. Returns accepted within 15 days.",
      
      regularPrice: 1500,
      salePrice: 1200,
      returnable: true,
      
      categoryId: "68c43828606de606b405789d",
      subCategoryId: "68c56e1ea067bbb188258725",
      
      stockSizeOption: "sizes",
      sizes: [
        {
          size: "Small",
          quantity: 25,
          hsnCode: "61091000", // Test HSN code
          sku: "TEST-SMALL-001",
          barcode: "123456789012",
          platformPricing: {
            yoraa: {
              enabled: true,
              price: 1500,
              salePrice: 1200
            },
            myntra: {
              enabled: true,
              price: 1500,
              salePrice: 1200
            }
          }
        },
        {
          size: "Medium",
          quantity: 30,
          hsnCode: "61091000", // Test HSN code
          sku: "TEST-MEDIUM-001",
          barcode: "123456789013",
          platformPricing: {
            yoraa: {
              enabled: true,
              price: 1500,
              salePrice: 1200
            }
          }
        }
      ],
      
      variants: [
        {
          name: "Variant 1",
          images: [], // Empty for now - would need actual uploaded URLs
          videos: [],
          filters: {
            color: "Blue",
            brand: "TestBrand"
          }
        }
      ],
      
      // Test size charts - would normally be uploaded URLs
      commonSizeChart: {
        cmChart: "", // Would be uploaded URL
        inchChart: "", // Would be uploaded URL
        measurementGuide: "", // Would be uploaded URL
        attachedToVariants: [],
        globalChart: ""
      },
      
      status: "draft"
    };
    
    console.log('📤 Sending product creation request...');
    
    const response = await axios.post(`${API_BASE}/products`, productData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    if (response.data.success) {
      console.log('✅ Product created successfully!');
      console.log('Product ID:', response.data.product.productId);
      
      // Check if shipping and returns data is properly structured
      const shippingData = response.data.product.shippingAndReturns;
      console.log('\n📦 Shipping and Returns Data:');
      console.log('- Shipping Details:', shippingData.shippingDetails);
      console.log('- Return Policy:', shippingData.returnPolicy);
      console.log('- Additional Info:', shippingData.additionalInfo);
      
      // Check if HSN codes are properly saved
      console.log('\n🏷️  HSN Code Data:');
      response.data.product.sizes.forEach((size, index) => {
        console.log(`- Size ${size.size}: HSN Code = "${size.hsnCode}"`);
      });
      
      // Check if common size chart structure is correct
      console.log('\n📏 Common Size Chart Data:');
      const commonSizeChart = response.data.product.commonSizeChart;
      console.log('- CM Chart:', commonSizeChart.cmChart);
      console.log('- Inch Chart:', commonSizeChart.inchChart);
      console.log('- Measurement Guide:', commonSizeChart.measurementGuide);
      console.log('- Global Chart:', commonSizeChart.globalChart);
      
      // Check if all expected fields are present and not empty/null
      console.log('\n🔍 Validation Results:');
      
      const validationChecks = [
        { 
          name: 'Shipping and Returns Structure', 
          pass: shippingData && typeof shippingData.additionalInfo === 'string' && shippingData.additionalInfo.length > 0
        },
        { 
          name: 'HSN Codes Present', 
          pass: response.data.product.sizes.every(size => size.hsnCode && size.hsnCode.length > 0)
        },
        { 
          name: 'Common Size Chart Structure', 
          pass: commonSizeChart && typeof commonSizeChart === 'object'
        }
      ];
      
      validationChecks.forEach(check => {
        console.log(`${check.pass ? '✅' : '❌'} ${check.name}`);
      });
      
      const allPassed = validationChecks.every(check => check.pass);
      console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall Result: ${allPassed ? 'All fixes working correctly!' : 'Some issues remain'}`);
      
    } else {
      console.error('❌ Product creation failed:', response.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.log('\n📋 Error Details:');
      console.log(JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testProductCreationWithFixes();
