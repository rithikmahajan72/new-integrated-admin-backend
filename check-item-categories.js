const mongoose = require('mongoose');
const Item = require('./src/models/Item');
const Category = require('./src/models/Category');
const SubCategory = require('./src/models/SubCategory');
require('dotenv').config();

const checkItemCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Get all items
    const items = await Item.find({}).limit(3);
    console.log(`Found ${items.length} items in database`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      console.log(`\n--- Item ${i + 1} ---`);
      console.log('ID:', item._id);
      console.log('Product Name:', item.productName);
      console.log('Category ID field:', item.categoryId);
      console.log('SubCategory ID field:', item.subCategoryId);
      console.log('Category field (if any):', item.category);
      console.log('SubCategory field (if any):', item.subCategory);
      
      // Try to populate
      const populatedItem = await Item.findById(item._id).populate('categoryId subCategoryId');
      console.log('Populated Category:', populatedItem.categoryId);
      console.log('Populated SubCategory:', populatedItem.subCategoryId);
    }

    // Also check available categories and subcategories
    const categories = await Category.find({}).limit(3);
    console.log(`\n--- Available Categories (${categories.length}) ---`);
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat._id})`);
    });

    const subCategories = await SubCategory.find({}).limit(5);
    console.log(`\n--- Available SubCategories (${subCategories.length}) ---`);
    subCategories.forEach(subCat => {
      console.log(`- ${subCat.name} (ID: ${subCat._id}) - Category: ${subCat.categoryId}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkItemCategories();
