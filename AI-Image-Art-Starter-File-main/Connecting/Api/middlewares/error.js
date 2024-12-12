const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ error: err.message }); // Fixed typo: 'josn' -> 'json'
  }
  return res.status(500).json({ error: "Internal Server Error" });
};

class CustomError extends Error {
  constructor(message, statusCode) {
    super(message); // Initialize the base Error class
    this.name = this.constructor.name;
    this.statusCode = statusCode; // Assign statusCode directly
  }
}

module.exports = { CustomError, errorHandler };
