const mongoose = require('mongoose');
const SubCategory = require('./src/models/SubCategory');
require('dotenv').config();

const createTestSubcategory = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Create a subcategory for the "aaaa" category (68d09d14912f2dd98c097770)
    const subcategory = new SubCategory({
      name: 'Test Subcategory',
      description: 'Test subcategory for aaaa category',
      categoryId: '68d09d14912f2dd98c097770',
      imageUrl: 'https://via.placeholder.com/150/000000/FFFFFF/?text=Test' // Placeholder image
    });

    const result = await subcategory.save();
    console.log('✅ Subcategory created successfully:');
    console.log('- ID:', result._id);
    console.log('- Name:', result.name);
    console.log('- Category ID:', result.categoryId);

  } catch (error) {
    console.error('❌ Error creating subcategory:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createTestSubcategory();
