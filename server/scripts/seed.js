const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../.env"),
  override: true,
});
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const { ensureDemoUsers } = require("../config/seedDemoUsers");

const seedDatabase = async () => {
  try {
    console.log("Starting database seeding...");
    await connectDB();
    await ensureDemoUsers();
    console.log("Seeding completed successfully.");
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error.message);
    process.exit(1);
  }
};

seedDatabase();
