const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const next = require("next");
const path = require("path");

dotenv.config({ path: "./config.env" });
const app = express();
const dev = process.env.NODE_ENV != "production";
const nextServer = next({ dev });
const handle = nextServer.getRequestHandler();

const authRoute = require("../Api/routes/auth");
const userRoute = require("../Api/routes/users");
const postRoute = require("../Api/routes/posts");

const { errorHandler } = require("../Api/middlewares/error");
const verifyToken = require("../Api/middlewares/verifyToken");

const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URL, {
    bufferCommands: false, // Disable buffering
    maxPoolSize: 10, // Increase connection pool size
  })
  .then(() => console.log("DB connection successfully"))
  .catch((err) => {
    console.error("DB connection failed:", err.message);
    process.exit(1); // Exit on failure
  });

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB!");
});

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoute);
app.use("/api/post", postRoute);
app.use("/api/user", verifyToken, userRoute);

app.use(errorHandler);

nextServer.prepare().then(() => {
  app.get("*", (req, res) => {
    return handle(req, res);
  });

  app.listen(port, () => {
    console.log(`App running on port ${port}`);
  });
});
