const Filter = require("../../models/Filter");

// ✅ Create a new filter
exports.createFilter = async (req, res) => {
  try {
    // Validate priority fields
    if (!req.body.priority || req.body.priority < 1) {
      return res.status(400).json({ error: "Filter priority must be a positive integer" });
    }

    // Check if priority already exists for another filter
    const existingFilter = await Filter.findOne({ priority: req.body.priority });
    if (existingFilter) {
      return res.status(400).json({ 
        error: `Priority ${req.body.priority} is already used by filter "${existingFilter.name}". Each filter must have a unique priority.` 
      });
    }

    if (req.body.values) {
      // Check for duplicate priorities within the same filter values
      const priorities = req.body.values.map(value => value.priority);
      const uniquePriorities = new Set(priorities);
      if (priorities.length !== uniquePriorities.size) {
        return res.status(400).json({ error: "Filter values cannot have duplicate priorities within the same filter" });
      }

      for (const value of req.body.values) {
        if (!value.priority || value.priority < 1) {
          return res.status(400).json({ error: `Value '${value.name}' priority must be a positive integer` });
        }
      }
    }

    // Create a new filter document
    const filter = new Filter(req.body);
    await filter.save();
    res.status(201).json(filter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Get all filters
exports.getAllFilters = async (req, res) => {
  console.log("Fetching all filters");
  try {
    // Fetch all filters, sort by priority
    const filters = await Filter.find().sort({ priority: 1 });
    // Sort values by priority within each filter
    filters.forEach((filter) => {
      filter.values.sort((a, b) => a.priority - b.priority);
    });
    console.log("Filters:", filters);
    res.json(filters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get a single filter by ID
exports.getFilterById = async (req, res) => {
  try {
    // Find filter and sort values by priority
    const filter = await Filter.findById(req.params.id);
    if (!filter) return res.status(404).json({ error: "Filter not found" });
    filter.values.sort((a, b) => a.priority - b.priority);
    res.json(filter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Update a filter by ID
exports.updateFilter = async (req, res) => {
  try {
    // Validate priority fields
    if (req.body.priority && req.body.priority < 1) {
      return res.status(400).json({ error: "Filter priority must be a positive integer" });
    }

    // Check if priority already exists for another filter (excluding current filter)
    if (req.body.priority) {
      const existingFilter = await Filter.findOne({ 
        priority: req.body.priority, 
        _id: { $ne: req.params.id } 
      });
      if (existingFilter) {
        return res.status(400).json({ 
          error: `Priority ${req.body.priority} is already used by filter "${existingFilter.name}". Each filter must have a unique priority.` 
        });
      }
    }

    if (req.body.values) {
      // Check for duplicate priorities within the same filter values
      const priorities = req.body.values.map(value => value.priority);
      const uniquePriorities = new Set(priorities);
      if (priorities.length !== uniquePriorities.size) {
        return res.status(400).json({ error: "Filter values cannot have duplicate priorities within the same filter" });
      }

      for (const value of req.body.values) {
        if (value.priority && value.priority < 1) {
          return res.status(400).json({ error: `Value '${value.name}' priority must be a positive integer` });
        }
      }
    }

    // Update filter
    const filter = await Filter.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!filter) return res.status(404).json({ error: "Filter not found" });
    filter.values.sort((a, b) => a.priority - b.priority);
    res.json(filter);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// ✅ Delete a filter by ID
exports.deleteFilter = async (req, res) => {
  try {
    const filter = await Filter.findByIdAndDelete(req.params.id);
    if (!filter) return res.status(404).json({ error: "Filter not found" });
    res.json({ message: "Filter deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Apply filters to search products (placeholder for product filtering)
exports.applyFilters = async (req, res) => {
  try {
    const filterCriteria = req.body;
    console.log("Applying filters:", filterCriteria);
    
    // This is a placeholder implementation
    // In a real application, you would use these filters to query products
    const response = {
      message: "Filters applied successfully",
      appliedFilters: filterCriteria,
      products: [], // This would contain filtered products in real implementation
      total: 0,
      pagination: {
        page: 1,
        limit: 20,
        totalPages: 0
      }
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get filters by key (e.g., get all color filters)
exports.getFiltersByKey = async (req, res) => {
  try {
    const { key } = req.params;
    const filter = await Filter.findOne({ key: key });
    
    if (!filter) {
      return res.status(404).json({ error: `Filter with key '${key}' not found` });
    }
    
    filter.values.sort((a, b) => a.priority - b.priority);
    res.json(filter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get price range for products (placeholder implementation)
exports.getPriceRange = async (req, res) => {
  try {
    // This would typically query actual product data
    const priceRange = {
      min: 0,
      max: 10000,
      currency: "INR"
    };
    
    res.json(priceRange);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get available sizes (placeholder implementation)  
exports.getAvailableSizes = async (req, res) => {
  try {
    const sizeFilter = await Filter.findOne({ key: "size" });
    
    if (!sizeFilter) {
      return res.json({ sizes: [] });
    }
    
    const sizes = sizeFilter.values
      .sort((a, b) => a.priority - b.priority)
      .map(v => v.name);
      
    res.json({ sizes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get available colors (placeholder implementation)
exports.getAvailableColors = async (req, res) => {
  try {
    const colorFilter = await Filter.findOne({ key: "color" });
    
    if (!colorFilter) {
      return res.json({ colors: [] });
    }
    
    const colors = colorFilter.values
      .sort((a, b) => a.priority - b.priority)
      .map(v => ({ name: v.name, code: v.code || "#000000" }));
      
    res.json({ colors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Get available brands
exports.getBrands = async (req, res) => {
  try {
    const brandFilter = await Filter.findOne({ key: "brand" });
    
    if (!brandFilter) {
      return res.json({ brands: [] });
    }
    
    const brands = brandFilter.values
      .sort((a, b) => a.priority - b.priority)
      .map(v => v.name);
      
    res.json({ brands });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};