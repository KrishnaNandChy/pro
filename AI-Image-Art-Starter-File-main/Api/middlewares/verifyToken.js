// middleware/verifyToken.js
const jwt = require("jsonwebtoken");
const { CustomError } = require("../middlewares/error");

const verifyToken = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return next(new CustomError("Unauthorized", 401));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new CustomError("Unauthorized", 401)); // Handle unauthorized error
    }
    req.user = decoded; // Attach user data to request object
    next(); // Proceed to the next middleware/controller
  });
};

module.exports = verifyToken;
