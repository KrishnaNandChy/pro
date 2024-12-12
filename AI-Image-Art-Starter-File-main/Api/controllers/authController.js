// controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");

const registerController = async (req, res, next) => {
  try {
    const { password, username, email } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      throw new CustomError("Username or email already exists", 400);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const newUser = new User({ ...req.body, password: hashedPassword });
    const savedUser = await newUser.save();

    // Respond with the saved user data
    res.status(201).json(savedUser);
  } catch (error) {
    // Catch and forward any error to the error handling middleware
    next(error);
  }
};

const loginController = async (req, res, next) => {
  try {
    let user;

    // Find user by email or username
    if (req.body.email) {
      user = await User.findOne({ email: req.body.email });
    } else {
      user = await User.findOne({ username: req.body.username });
    }

    // If user doesn't exist
    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    // Check if the password matches
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      throw new CustomError("Wrong Credentials!", 401);
    }

    // Exclude the password from the response data
    const { password, ...data } = user._doc;

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });

    // Send the token as a cookie and response
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Set secure flag only in production
        sameSite: "None",
      })
      .status(200)
      .json(data);
  } catch (error) {
    next(error);
  }
};

const logoutController = async (req, res, next) => {
  try {
    // Clear the token cookie
    res
      .clearCookie("token", {
        sameSite: "None",
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json("User logged out successfully");
  } catch (error) {
    next(error);
  }
};

const refetchUserController = async (req, res, next) => {
  try {
    const id = req.user._id; // Get user ID from the token decoded in the middleware
    const user = await User.findOne({ _id: id });

    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    res.status(200).json(user);
  } catch (error) {
    next(error); // Forward any error to the error-handling middleware
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  refetchUserController,
};
