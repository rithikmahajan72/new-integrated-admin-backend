const express = require("express");
const productController = require("../controllers/Product");
const ProductRouter = express.Router();
const { verifyToken } = require("../middleware/VerifyToken");
const checkAdminRole = require("../middleware/checkAdminRole"); // Updated import

ProductRouter
	.post("/", verifyToken, checkAdminRole, productController.create)
	.get("/", verifyToken, productController.getAll)
	.get("/:id", verifyToken, productController.getById)
	.patch("/:id", verifyToken, checkAdminRole, productController.updateById)
	.patch("/undelete/:id", verifyToken, checkAdminRole, productController.undeleteById)
	.delete("/:id", verifyToken, checkAdminRole, productController.deleteById);
	
module.exports = ProductRouter;
