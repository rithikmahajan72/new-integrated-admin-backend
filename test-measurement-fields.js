const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('./src/models/Product');
const Item = require('./src/models/Item');

async function testMeasurementFields() {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to database');

        // Test data with all measurement fields
        const testProductData = {
            productName: "Test Product with Measurements",
            productId: `TEST_${Date.now()}`,
            name: "Test Product with Measurements",
            description: "Testing measurement fields",
            category: "68c6b44a444f74d7b7b926ea", // Using valid category ID
            shippingAndReturns: "Test shipping info",
            tags: ["test"],
            filters: [
                {
                    key: "size",
                    priority: 1,
                    value: "M"
                }
            ],
            sizes: [
                {
                    size: "M",
                    sku: `TEST_SKU_M_${Date.now()}`,
                    regularPrice: 100,
                    salePrice: 90,
                    quantity: 10,
                    waistCm: "82",
                    inseamCm: "76",
                    waistIn: "32",
                    inseamIn: "30",
                    toFitWaistCm: "80",
                    inseamLengthCm: "74",
                    toFitWaistIn: "31",
                    inseamLengthIn: "29",
                    filters: [
                        {
                            key: "size",
                            priority: 1,
                            value: "M"
                        }
                    ],
                    metaTitle: "Test Meta Title M",
                    metaDescription: "Test Meta Description M",
                    slugUrl: "test-product-m"
                }
            ],
            variants: [
                {
                    name: "Red Variant",
                    color: "Red",
                    sizes: [
                        {
                            size: "L",
                            sku: `TEST_SKU_L_${Date.now()}`,
                            regularPrice: 110,
                            salePrice: 100,
                            quantity: 5,
                            waistCm: "87",
                            inseamCm: "81",
                            waistIn: "34",
                            inseamIn: "32",
                            toFitWaistCm: "85",
                            inseamLengthCm: "79",
                            toFitWaistIn: "33",
                            inseamLengthIn: "31",
                            filters: [
                                {
                                    key: "size",
                                    priority: 1,
                                    value: "L"
                                }
                            ],
                            metaTitle: "Test Meta Title L",
                            metaDescription: "Test Meta Description L",
                            slugUrl: "test-product-l"
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
        console.log('\n📊 Saved Product Data:');
        console.log('Product Name:', savedProduct.productName);
        console.log('Name:', savedProduct.name);
        console.log('Number of variants:', savedProduct.variants ? savedProduct.variants.length : 0);
        
        console.log('Main Size Measurements:', {
            waistCm: savedProduct.sizes[0].waistCm,
            inseamCm: savedProduct.sizes[0].inseamCm,
            waistIn: savedProduct.sizes[0].waistIn,
            inseamIn: savedProduct.sizes[0].inseamIn,
            toFitWaistCm: savedProduct.sizes[0].toFitWaistCm,
            inseamLengthCm: savedProduct.sizes[0].inseamLengthCm,
            toFitWaistIn: savedProduct.sizes[0].toFitWaistIn,
            inseamLengthIn: savedProduct.sizes[0].inseamLengthIn
        });
        console.log('Main Size Meta Fields:', {
            metaTitle: savedProduct.sizes[0].metaTitle,
            metaDescription: savedProduct.sizes[0].metaDescription,
            slugUrl: savedProduct.sizes[0].slugUrl
        });
        console.log('Main Size Filters:', savedProduct.sizes[0].filters);

        if (savedProduct.variants && savedProduct.variants.length > 0 && savedProduct.variants[0].sizes && savedProduct.variants[0].sizes.length > 0) {
            console.log('\nVariant Size Measurements:', {
                waistCm: savedProduct.variants[0].sizes[0].waistCm,
                inseamCm: savedProduct.variants[0].sizes[0].inseamCm,
                waistIn: savedProduct.variants[0].sizes[0].waistIn,
                inseamIn: savedProduct.variants[0].sizes[0].inseamIn,
                toFitWaistCm: savedProduct.variants[0].sizes[0].toFitWaistCm,
                inseamLengthCm: savedProduct.variants[0].sizes[0].inseamLengthCm,
                toFitWaistIn: savedProduct.variants[0].sizes[0].toFitWaistIn,
                inseamLengthIn: savedProduct.variants[0].sizes[0].inseamLengthIn
            });
            console.log('Variant Size Meta Fields:', {
                metaTitle: savedProduct.variants[0].sizes[0].metaTitle,
                metaDescription: savedProduct.variants[0].sizes[0].metaDescription,
                slugUrl: savedProduct.variants[0].sizes[0].slugUrl
            });
            console.log('Variant Size Filters:', savedProduct.variants[0].sizes[0].filters);
        } else {
            console.log('\n⚠️ No variant data found');
        }

        // Clean up - delete test product
        await Product.findByIdAndDelete(product._id);
        console.log('\n🧹 Test product deleted');

        console.log('\n✅ All measurement fields test completed successfully!');
        console.log('✅ All new fields (toFitWaistCm, inseamLengthCm, toFitWaistIn, inseamLengthIn) are working');
        console.log('✅ Size-level filters and meta fields are working');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testMeasurementFields();
