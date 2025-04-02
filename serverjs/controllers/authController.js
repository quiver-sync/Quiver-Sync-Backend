const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const bcrypt = require("bcryptjs");
const Brand = require("../models/Brand");



// Create Access Token
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      status: user.status,
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

// Create Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id,
      username: user.username,
      status: user.status, },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, picture } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const newUser = await User.create({
      username,
      email,
      password,
      picture,
    });

    const token = generateAccessToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000, // 15 mins
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(201)
      .json({
        user: {
          id: newUser._id,
          username: newUser.username,
          status: newUser.status,
        },
      });
  } catch (err) {
    console.error("Register error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        user: {
          id: user._id,
          username: user.username,
          status: user.status,
          picture: user.picture,
        },
      });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGOUT
exports.logout = (req, res) => {
  res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
    .clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
    })
    .status(200)
    .json({ message: "Logged out" });
};

//GetProfile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

//UpdateProfile
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update allowed fields only
    const fields = ["username", "height", "weight", "level", "picture"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      level: user.level,
      height: user.height,
      weight: user.weight,
      picture: user.picture,
      status: user.status,
    });
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};


// ME
exports.getMe = (req, res) => {
  res.status(200).json({
    user: {
      id: req.user.id,
      username: req.user.username,
      status: req.user.status,
      picture: req.picture,
    },
  });
};


exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const newAccessToken = generateAccessToken(user);

    res
      .cookie("token", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      })
      .status(200)
      .json({
        message: "Token refreshed",
        user: {
          id: user._id,
          username: user.username,
          status: user.status,
          picture: user.picture,
        },
      });
  } catch (err) {
    console.error("Refresh error:", err.message);
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};


//Google sign in 


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleSignIn = async (req, res) => {
  const { credential } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        username: name.replace(/\s/g, ""), // remove spaces from name
        email,
        picture,
        password: Math.random().toString(36).slice(-8), // random temp password
      });
    }

    const token = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 15 * 60 * 1000,
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          status: user.status,
          picture: user.picture,
        },
      });
  } catch (err) {
    console.error("Google Sign-In error:", err.message);
    res.status(401).json({ message: "Invalid Google credentials" });
  }
};
//----------------------------------------------------------------------------------------------


exports.saveBrands = async (req, res) => {
  try {
    const brandData = req.body;

    // Convert to [{ name, models: [] }] structure and insert
    const formatted = Object.entries(brandData).map(([name, models]) => ({
      name,
      models,
    }));
    // Optional: clear existing brands first
    await Brand.deleteMany();

    await Brand.insertMany(formatted);

    res.status(201).json({ message: "Brands saved successfully!" });
  } catch (err) {
    console.error("Error saving brands:", err.message);
    res.status(500).json({ message: "Failed to save brands." });
  }
};


exports.getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.find(); 
    res.status(200).json(brands); 
  } catch (error) {
    console.error("Failed to fetch brands:", error.message);
    res.status(500).json({ message: "Server error. Could not retrieve brands." });
  }
};

