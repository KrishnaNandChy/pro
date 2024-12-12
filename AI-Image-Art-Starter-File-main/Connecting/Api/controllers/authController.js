const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");

// Register User Controller
const registerController = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if username or email already exists
    // const existingUser = await User.findOne({ $or: [{ name }, { email }] });

    // if (existingUser) {
    //   throw new CustomError("Username or email already exists", 400);
    // }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const newUser = new User({ ...req.body, password: hashedPassword });
    const savedUser = await newUser.save();

    // Respond with the saved user data excluding the password
    const { password: _, ...userData } = savedUser._doc;

    res.status(201).json(userData);
  } catch (err) {
    console.error("Error during registration:", err);
    next(err); // Forward the error to the next middleware
  }
};

// Login User Controller
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
        secure: process.env.NODE_ENV === "production",
        sameSite: "None",
      })
      .status(200)
      .json(data);
  } catch (error) {
    console.error("Error during login:", error);
    next(error); // Forward error to middleware
  }
};

// Logout User Controller
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
    console.error("Error during logout:", error);
    next(error); // Forward error to middleware
  }
};

// Refetch Current User Controller
const refetchUserController = async (req, res, next) => {
  const token = req.cookies.token;
  try {
    if (!token) {
      throw new CustomError("Token not found", 401);
    }

    // Verify the token and decode it
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded._id;

    // Find the user by ID
    const user = await User.findById(id);

    if (!user) {
      throw new CustomError("User not found!", 404);
    }

    // Exclude password from response
    const { password, ...userData } = user._doc;
    res.status(200).json(userData);
  } catch (error) {
    console.error("Error during refetching user:", error);
    next(error); // Forward error to middleware
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  refetchUserController,
};
