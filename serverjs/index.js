require("dotenv").config({ path: "./config.env" });
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./db/connect");
require("./cronJobs/syncRentalStatus");
const authRoutes = require("./routers/authRoutes");
const boardRoutes = require("./routers/boardRoutes");
const forecastRoutes = require("./routers/forecastRoutes");
const matchBoardRoutes = require("./routers/matchBoardRoutes");
const brandsRoutes = require("./routers/brandsRoutes");
const rentalRoutes = require("./routers/rentals");
const rentalReq = require('./routers/rentalRequests');
const ActiveRental = require('./routers/activeRentals')



const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173", // your frontend origin
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/match", matchBoardRoutes);
app.use("/api/brands", brandsRoutes);
app.use("/api/rentals", rentalRoutes);
app.use('/api/rental-requests', rentalReq);
app.use('/api/active-rentals', ActiveRental);






console.log("👋 Index.js file loaded");

// Start server
const start = async () => {
  try {
    console.log("got into start")
    await connectDB(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.log("damn error somehow")
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

start();
