const User = require("../../models/User");
const UserProfile = require("../../models/UserProfile");
const mongoose = require("mongoose");

// ✅ Get the logged-in user's details
exports.getById = async (req, res) => {
    try {
        const id = req.user._id;
        console.log("Fetching user by ID:", id);

        // Validate if the ID is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            console.log("Invalid ObjectId format:", id);
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Get user first, then check if it exists
        const user = await User.findById(id);
        
        if (!user) {
            console.log("User not found with ID:", id);
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert to plain object and remove sensitive data
        const result = user.toObject();
        delete result.password;

        res.status(200).json(result);
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        res.status(500).json({ message: 'Error getting your details, please try again later' });
    }
};

// ✅ Update a user's data by ID (typically for admin use)
exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;

        // Update user with new data and return the updated object
        const updated = await User.findByIdAndUpdate(id, req.body, { new: true });
        
        if (!updated) {
            console.log("User not found for update with ID:", id);
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert to plain object and remove sensitive data
        const result = updated.toObject();
        delete result.password;

        res.status(200).json(result);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'Error updating user details, please try again later' });
    }
};

// ✅ Get all users with their profiles (excluding passwords)
exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all user profiles and populate the related user info
        const users = await UserProfile.find({}, { password: 0 }).populate('user'); // Adjust field names if needed

        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: "Error fetching users, please try again later" });
    }
};
