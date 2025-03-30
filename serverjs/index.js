require("dotenv").config({ path: "./config.env" });
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./db/connect");

const authRoutes = require("./routers/authRoutes");
const boardRoutes = require("./routers/boardRoutes");
const forecastRoutes = require("./routers/forecastRoutes");



const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5173", // your frontend origin
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/boards", boardRoutes);
app.use("/api/forecast", forecastRoutes);



// Start server
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error("❌ MongoDB connection failed", error);
    process.exit(1);
  }
};

start();
