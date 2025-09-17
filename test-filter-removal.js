const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./src/models/Product');

async function testFilterRemoval() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database');

        // Test data with filters at size level only
        const testProductData = {
            productName: "Test Product Filter Removal",
            productId: `TEST_FILTER_${Date.now()}`,
            name: "Test Product Filter Removal",
            description: "Testing filter removal",
            category: "68c6b44a444f74d7b7b926ea", // Using valid category ID
            shippingAndReturns: "Test shipping info",
            tags: ["test"],
            sizes: [
                {
                    size: "M",
                    sku: `TEST_FILTER_SKU_M_${Date.now()}`,
                    regularPrice: 100,
                    salePrice: 90,
                    quantity: 10,
                    waistCm: "82",
                    toFitWaistCm: "80",
                    filters: [
                        {
                            key: "size",
                            priority: 1,
                            value: "M"
                        },
                        {
                            key: "color",
                            priority: 2,
                            value: "Blue"
                        }
                    ],
                    metaTitle: "Test Meta Title M",
                    metaDescription: "Test Meta Description M",
                    slugUrl: "test-product-filter-m"
                }
            ],
            variants: [
                {
                    name: "Red Variant",
                    color: "Red",
                    sizes: [
                        {
                            size: "L",
                            sku: `TEST_FILTER_SKU_L_${Date.now()}`,
                            regularPrice: 110,
                            salePrice: 100,
                            quantity: 5,
                            waistCm: "87",
                            toFitWaistCm: "85",
                            filters: [
                                {
                                    key: "size",
                                    priority: 1,
                                    value: "L"
                                },
                                {
                                    key: "color",
                                    priority: 2,
                                    value: "Red"
                                }
                            ],
                            metaTitle: "Test Meta Title L",
                            metaDescription: "Test Meta Description L",
                            slugUrl: "test-product-filter-l"
                        }
                    ]
                }
            ]
        };

        // Create test product
        const product = new Product(testProductData);
        await product.save();
        console.log('✅ Product saved successfully with ID:', product._id);

        // Retrieve and verify the saved data
        const savedProduct = await Product.findById(product._id);
        console.log('\n📊 Filter Test Results:');
        
        // Check if product-level filters exist (should be undefined/missing)
        console.log('Product-level filters:', savedProduct.filters);
        console.log('Product has filters field:', 'filters' in savedProduct.toObject());
        
        // Check if size-level filters exist (should have data)
        console.log('\nSize-level filters:');
        console.log('Main size filters:', savedProduct.sizes[0].filters);
        console.log('Variant size filters:', savedProduct.variants?.[0]?.sizes?.[0]?.filters);
        
        // Clean up - delete test product
        await Product.findByIdAndDelete(product._id);
        console.log('\n🧹 Test product deleted');

        if (!('filters' in savedProduct.toObject())) {
            console.log('\n✅ SUCCESS: Product-level filters field has been removed!');
        } else {
            console.log('\n❌ ISSUE: Product-level filters field still exists');
        }

        if (savedProduct.sizes[0].filters && savedProduct.sizes[0].filters.length > 0) {
            console.log('✅ SUCCESS: Size-level filters are working correctly!');
        } else {
            console.log('❌ ISSUE: Size-level filters are not working');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testFilterRemoval();
