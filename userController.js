const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ==============================
// REGISTER
// ==============================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        coins: user.coins,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// LOGIN
// ==============================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "1d" }
);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        coins: user.coins,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// ADVANCED LEADERBOARD
// ==============================
exports.getLeaderboard = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalUsers = await User.countDocuments();

    const users = await User.find()
      .sort({ coins: -1, createdAt: 1 }) // stable tie handling
      .skip(skip)
      .limit(limit)
      .select("name coins createdAt");

    const leaderboard = users.map((user, index) => {

      let level = "Beginner";

      if (user.coins >= 5000) level = "Gold";
      else if (user.coins >= 1500) level = "Silver";
      else if (user.coins >= 500) level = "Bronze";

      return {
        rank: skip + index + 1,
        name: user.name,
        coins: user.coins,
        level,
      };
    });

    let currentUserRank = null;

    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      try {
        const decoded = jwt.verify(token, "secretkey");

        const allUsers = await User.find()
          .sort({ coins: -1, createdAt: 1 })
          .select("_id");

        const rankIndex = allUsers.findIndex(
          (user) => user._id.toString() === decoded.id
        );

        if (rankIndex !== -1) {
          currentUserRank = rankIndex + 1;
        }

      } catch (err) {
        // invalid token ignored
      }
    }

    res.json({
      page,
      limit,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      leaderboard,
      currentUserRank,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};