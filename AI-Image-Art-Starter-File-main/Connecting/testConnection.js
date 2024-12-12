require("dotenv").config();
const mongoose = require("mongoose");

// Retrieve MongoDB URL from the environment variable
const mongoUrl = process.env.MONGODB_URL;

if (!mongoUrl) {
  console.error("MONGODB_URL is not defined in the .env file.");
  process.exit(1);
}

// Connect to MongoDB
mongoose
  .connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Successfully connected to MongoDB.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  });
