require("dotenv").config();

// Check each required environment variable
const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URL",
  "JWT_SECRET",
  "DOMAIN_URL",
];

let allLoaded = true;

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  if (!value) {
    console.error(`Missing environment variable: ${envVar}`);
    allLoaded = false;
  } else {
    console.log(`Loaded ${envVar}: ${value}`);
  }
});

if (!allLoaded) {
  console.error(
    "Some environment variables are missing. Check your .env file."
  );
  process.exit(1);
} else {
  console.log("All required environment variables are loaded successfully.");
}
