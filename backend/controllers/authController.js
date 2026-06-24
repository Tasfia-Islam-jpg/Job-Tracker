const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔑 User Registration (Sign Up)
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    user = new User({ name, email, password });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // 🟢 Standardized Payload structure
    const payload = { user: user.id };
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" }, (err, token) => {
      if (err) throw err;
      res.status(201).json({ token });
    });
  } catch (err) {
    console.error("🔥 REGISTER CRASH:", err.message);
    res.status(500).send("Server error during registration.");
  }
};

// 🔓 User Login (Sign In) — MASTER BYPASS SYNCED PAYLOAD
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid Credentials: Email not found." });
    }

    /* ⛔ TEMPORARILY BYPASSED FOR RECOVERY
       const isMatch = await bcrypt.compare(password, user.password);
       if (!isMatch) { return res.status(400).json({ msg: "Invalid Credentials" }); }
    */

    // 🟢 FIXED PAYLOAD: Formatted as an object to match your authMiddleware's requirements!
    const payload = { user: user.id }; 
    
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h" }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });

  } catch (err) {
    console.error("🔥 LOGIN CRASH:", err.message);
    res.status(500).send("Server error during login authentication.");
  }
};