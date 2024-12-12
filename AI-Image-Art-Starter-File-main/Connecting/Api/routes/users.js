const express = require("express");
const {
  getUserController,
  updateUserController,
  buyCredit,
} = require("../controllers/userController");
const verifyToken = require("../middlewares/verifyToken"); // Add token verification middleware
const router = express.Router();

// Get user by ID (authentication might be required)
router.get("/:userId", verifyToken, getUserController);

// Update user data (authentication required)
router.put("/update/:userId", verifyToken, updateUserController);

// Update credits (authentication required)
router.put("/update-credit/:userId", verifyToken, buyCredit);

module.exports = router;
