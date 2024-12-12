const express = require("express");
const {
  createPostWithImagesController_V3,
  createPostWithImagesController_V2,
  getPostsController,
  getSinglePostController,
  getUserPostController,
  deletePostController,
  likePostController,
  dislikePostController,
} = require("../controllers/postController");
const verifyToken = require("../middlewares/verifyToken"); // Add token verification middleware
const router = express.Router();

// Create post (V3)
router.post(
  "/create/v3/:userId",
  verifyToken,
  createPostWithImagesController_V3
);

// Create post (V2)
router.post(
  "/create/v2/:userId",
  verifyToken,
  createPostWithImagesController_V2
);

// Get all posts
router.get("/all", getPostsController);

// Get single post
router.get("/single/:postId", getSinglePostController);

// Get posts by user
router.get("/user/:userId", getUserPostController);

// Delete a post (authentication required)
router.delete("/delete/:postId", verifyToken, deletePostController);

// Like a post (authentication required)
router.put("/like/:postId", verifyToken, likePostController);

// Dislike a post (authentication required)
router.put("/dislike/:postId", verifyToken, dislikePostController);

module.exports = router;
