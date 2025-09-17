const axios = require('axios');

// Test script to verify the backend image/video fix
async function testProductAPI() {
    try {
        console.log('🧪 Testing Product API with Image/Video Fix...\n');

        const API_BASE = 'http://localhost:5000/api';
        const PRODUCT_ID = '68c96bab8d903c93750e4c95';

        // Test 1: Get single product
        console.log('1️⃣ Testing GET single product...');
        try {
            const response = await axios.get(`${API_BASE}/products/${PRODUCT_ID}`);
            const product = response.data.data;
            
            console.log('✅ API Response Status:', response.status);
            console.log('✅ Response Structure:', {
                success: response.data.success,
                message: response.data.message,
                statusCode: response.data.statusCode
            });
            
            console.log('\n📊 Product Data:');
            console.log('- ID:', product.id);
            console.log('- Product Name:', product.productName);
            console.log('- Title:', product.title);
            console.log('- Category:', product.category);
            console.log('- Subcategory:', product.subcategory);
            console.log('- Status:', product.status);
            console.log('- Price:', product.price);
            console.log('- Regular Price:', product.regularPrice);
            console.log('- Sale Price:', product.salePrice);
            
            console.log('\n📸 Image Data:');
            console.log('- ImageUrl:', product.imageUrl ? 'Present' : 'Missing');
            console.log('- Main Images Count:', product.images?.length || 0);
            console.log('- Variant Images Count:', product.variants?.[0]?.images?.length || 0);
            
            if (product.images?.length > 0) {
                console.log('- First Image URL:', product.images[0].url?.substring(0, 100) + '...');
            }
            
            console.log('\n🎥 Video Data:');
            console.log('- Main Videos Count:', product.videos?.length || 0);
            console.log('- Variant Videos Count:', product.variants?.[0]?.videos?.length || 0);
            
            if (product.videos?.length > 0) {
                console.log('- First Video URL:', product.videos[0].url?.substring(0, 100) + '...');
            }
            
            console.log('\n📦 Stock Data:');
            console.log('- Stock:', product.stock);
            console.log('- Total Stock:', product.totalStock);
            console.log('- Sizes Count:', product.sizes?.length || 0);
            
            console.log('\n🔧 Variant Data:');
            console.log('- Variants Count:', product.variants?.length || 0);
            if (product.variants?.[0]) {
                console.log('- First Variant Name:', product.variants[0].name);
                console.log('- First Variant Images:', product.variants[0].images?.length || 0);
                console.log('- First Variant Videos:', product.variants[0].videos?.length || 0);
            }
            
            // Check if the fix worked
            const hasMainImages = product.images && product.images.length > 0;
            const hasVariantImages = product.variants?.[0]?.images?.length > 0;
            const hasImageUrl = !!product.imageUrl;
            
            console.log('\n🎯 Fix Verification:');
            console.log('- Main images populated:', hasMainImages ? '✅' : '❌');
            console.log('- ImageUrl populated:', hasImageUrl ? '✅' : '❌');
            console.log('- Variant images present:', hasVariantImages ? '✅' : '❌');
            
            if (hasMainImages && hasImageUrl) {
                console.log('🎉 SUCCESS: Images are now properly mapped to main fields!');
            } else if (hasVariantImages) {
                console.log('⚠️ PARTIAL: Variant images exist but main mapping may need fix');
            } else {
                console.log('❌ ISSUE: No images found in either main or variant fields');
            }
            
        } catch (error) {
            console.error('❌ Error fetching single product:', error.message);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
        }

        // Test 2: Get all products
        console.log('\n2️⃣ Testing GET all products...');
        try {
            const response = await axios.get(`${API_BASE}/products?limit=5`);
            const products = response.data.data;
            
            console.log('✅ API Response Status:', response.status);
            console.log('✅ Products Count:', products?.length || 0);
            
            if (products && products.length > 0) {
                console.log('\n📊 First Product Overview:');
                const firstProduct = products[0];
                console.log('- Name:', firstProduct.name);
                console.log('- Images:', firstProduct.images?.length || 0);
                console.log('- Videos:', firstProduct.videos?.length || 0);
                console.log('- ImageUrl:', firstProduct.imageUrl ? 'Present' : 'Missing');
            }
            
        } catch (error) {
            console.error('❌ Error fetching all products:', error.message);
        }

        console.log('\n🏁 Test completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testProductAPI();
