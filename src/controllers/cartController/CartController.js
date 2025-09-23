const Cart = require("../../models/Cart");
const { ApiResponse } = require("../../utils/ApiResponse");
const Item = require("../../models/Item"); // Model for the item being added to the cart

// ✅ Add item to cart
exports.create = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const { itemId, size, sku, quantity } = req.body; // Extract relevant data from request body
    console.log("sku", sku);
    const userId = req.user._id; // Get current user's ID from authenticated request

    // Check if the item exists in the database
    const itemExists = await Item.findById(itemId);
    if (!itemExists) {
      return res.status(404).json(ApiResponse(null, "Item not found", false, 404));
    }

    // Validate that the size and sku exist in the item
    const sizeVariant = itemExists.sizes.find(s => s.size === size && s.sku === sku);
    if (!sizeVariant) {
      return res.status(400).json(ApiResponse(null, "Invalid size or SKU", false, 400));
    }

    // If item with same SKU already exists in cart, just update its quantity
    let existingCartItem = await Cart.findOne({ user: userId, item: itemId, sku });
    if (existingCartItem) {
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res.status(200).json(ApiResponse(existingCartItem, "Cart updated successfully", true, 200));
    }

    // Otherwise, add a new item entry to the cart
    const newCartItem = new Cart({
      user: userId,
      item: itemId,
      size, // Size from the item's sizes
      sku, // Stock Keeping Unit, uniquely identifies the item variant
      quantity,
    });
    await newCartItem.save();

    res.status(201).json(ApiResponse(newCartItem, "Item added to cart successfully", true, 201));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse(null, "Error adding product to cart", false, 500));
  }
};

// ✅ Get cart items for the current user
exports.getByUserId = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all cart items for this user, and populate item field
    const result = await Cart.find({ user: userId })
      .populate("item"); // Fetch full item details including sizes

    res.status(200).json(ApiResponse(result, "Cart retrieved successfully", true, 200));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse(null, "Error fetching cart items", false, 500));
  }
};

// ✅ Update cart item quantity, size, or SKU
exports.updateById = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, size, sku } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (quantity !== undefined) updateData.quantity = quantity;
    if (size !== undefined) updateData.size = size;
    if (sku !== undefined) updateData.sku = sku;

    // Find cart item by ID and update it
    const updated = await Cart.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("item");

    if (!updated) {
      return res.status(404).json(ApiResponse(null, "Cart item not found", false, 404));
    }

    res.status(200).json(ApiResponse(updated, "Cart item updated successfully", true, 200));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse(null, "Error updating cart item", false, 500));
  }
};

// ✅ Delete a specific cart item
exports.deleteById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find cart item by ID and delete it
    const deleted = await Cart.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json(ApiResponse(null, "Cart item not found", false, 404));
    }

    res.status(200).json(ApiResponse(null, "Cart item removed successfully", true, 200));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse(null, "Error deleting cart item", false, 500));
  }
};

// ✅ Clear cart for a user
exports.deleteByUserId = async (req, res) => {
  try {
    const userId = req.user._id;

    // Remove all cart items associated with the user
    await Cart.deleteMany({ user: userId });

    res.status(200).json(ApiResponse(null, "Cart cleared successfully", true, 200));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse(null, "Error clearing cart", false, 500));
  }
};

// ✅ Delete a cart item by itemId for a specific user
exports.deleteByItemId = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemId } = req.params;

    // Remove a specific item from the user's cart
    const deletedItem = await Cart.findOneAndDelete({ user: userId, item: itemId });

    if (!deletedItem) {
      return res.status(404).json(ApiResponse(null, "Cart item not found", false, 404));
    }

    res.status(200).json(ApiResponse(null, "Cart item removed successfully", true, 200));
  } catch (error) {
    console.log(error);
    res.status(500).json(ApiResponse(null, "Error deleting cart item", false, 500));
  }
};
