const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  // Check if header exists
  if (!authHeader) {
    return res.status(401).json({
      message: "No token provided. Authorization denied.",
    });
  }

  try {
    // Expecting format: Bearer TOKEN
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token format invalid.",
      });
    }

   const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach decoded user info to request
    req.user = decoded;

    next(); // Move to next middleware / controller
  } catch (error) {
    return res.status(401).json({
      message: "Token is not valid.",
    });
  }
};

module.exports = authMiddleware;