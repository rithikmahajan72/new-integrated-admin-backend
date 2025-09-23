// Test script to verify item update with category/subcategory
const axios = require('axios');

const BASE_URL = 'http://localhost:8080';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2OGNkNzFmM2YzMWViNWQ3MmE2YzhlMjUiLCJuYW1lIjoiSm9oeWVlaW50ZWVldHkgcnRvZSIsInBoTm8iOiI3MDM2NTY3ODkwIiwiaXNWZXJpZmllZCI6dHJ1ZSwiaXNQaG9uZVZlcmlmaWVkIjp0cnVlLCJpc0VtYWlsVmVyaWZpZWQiOnRydWUsImlzQWRtaW4iOnRydWUsImlzUHJvZmlsZSI6dHJ1ZSwiZW1haWwiOiJ1c2VyQGV4YW1wbGUuY29tIiwicGxhdGZvcm0iOm51bGwsImlhdCI6MTc1ODU4NjYyNSwiZXhwIjoxNzU5MTkxNDI1fQ.9zqTP3wswjNF6JBUPM9dTfmkivy5BZK4AcOutacoivc';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${JWT_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

const testItemUpdate = async () => {
  try {
    console.log('🧪 Testing Item Update with Category/Subcategory...\n');

    // 1. Get available categories
    const categoriesResponse = await api.get('/api/categories');
    const categories = categoriesResponse.data.data || [];
    console.log('📋 Available categories:', categories.map(c => `${c.name} (${c._id})`));

    if (categories.length === 0) {
      console.log('❌ No categories available');
      return;
    }

    // 2. Get available subcategories  
    const subCategoriesResponse = await api.get('/api/subcategories');
    const subCategories = subCategoriesResponse.data || [];
    console.log('📋 Available subcategories:', subCategories.map(s => `${s.name} (${s._id}) - Category: ${s.categoryId}`));

    // 3. Get existing items
    const itemsResponse = await api.get('/api/items');
    const items = itemsResponse.data.items || [];
    console.log(`📋 Found ${items.length} existing items`);

    if (items.length === 0) {
      console.log('❌ No items available to test');
      return;
    }

    const testItem = items[0];
    console.log(`\n🎯 Testing with item: "${testItem.productName}"`);
    console.log(`   - MongoDB ID: ${testItem._id}`);
    console.log(`   - Product ID: ${testItem.productId}`);

    // 4. Test update with category/subcategory
    const updateData = {
      categoryId: categories[0]._id, // Use first available category
      subCategoryId: subCategories[0]?._id || categories[0]._id, // Use first subcategory or fallback
      images: [],
      filters: [],
      variants: [],
      alsoShowInOptions: {}
    };

    console.log(`\n📝 Attempting update with:`);
    console.log(`   - Category: ${categories[0].name} (${categories[0]._id})`);
    console.log(`   - SubCategory: ${subCategories[0]?.name || 'Using category ID as fallback'} (${updateData.subCategoryId})`);

    // Try draft-configuration endpoint with productId (not _id)
    const updateResponse = await api.put(`/api/items/${testItem.productId}/draft-configuration`, updateData);
    
    if (updateResponse.data.success) {
      console.log('✅ SUCCESS: Item updated successfully!');
      console.log('Response:', updateResponse.data);
    } else {
      console.log('❌ FAILED: Update unsuccessful');
      console.log('Response:', updateResponse.data);
    }

  } catch (error) {
    console.error('❌ ERROR during test:', error.response?.data || error.message);
  }
};

testItemUpdate();
