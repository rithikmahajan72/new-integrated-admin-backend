// Import required modules
const express = require("express");

// Import user controller containing business logic for user operations
const userController = require("../controllers/userController/UserController");

// Import middleware to verify JWT token
const { verifyToken } = require("../middleware/VerifyToken");

// Create a new router instance
const router = express.Router();

/**
 * @route   GET /getUser
 * @desc    Get the authenticated user's details by token
 * @access  Protected
 */
router.get("/getUser", verifyToken, userController.getById);

/**
 * @route   PATCH /:id
 * @desc    Update user data by user ID
 * @access  Public (⚠️ Consider adding verifyToken if this should be protected)
 */
router.patch("/:id", userController.updateById);

/**
 * @route   GET /getAlluser
 * @desc    Get a list of all users
 * @access  Protected
 */
router.get("/getAlluser", verifyToken, userController.getAllUsers);

/**
 * @route   POST /make-admin/:userId
 * @desc    Make a user admin (temporary development route)
 * @access  Protected
 */
router.post("/make-admin/:userId", verifyToken, async (req, res) => {
  try {
    const User = require("../models/User");
    const { userId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { isAdmin: true },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json({ 
      message: "User promoted to admin successfully", 
      user: { id: user._id, isAdmin: user.isAdmin, name: user.name, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ message: "Error promoting user to admin", error: error.message });
  }
});

// Export the router to be used in the main app
module.exports = router;
