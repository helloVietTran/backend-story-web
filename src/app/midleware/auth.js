require('dotenv').config();
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];
  const signature = process.env.ACCESS_TOKEN_SECRET;
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, signature);
    req.id = decoded.id;
  } catch (err) {
    return res.status(403).json({ message: "Invalid token" });
  }

  next();
};
module.exports = auth;
