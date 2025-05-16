import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    // Ensure the cookie-parser middleware is being used in your app
    const token = req.cookies?.token; 

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    // Attach user ID to request
    req.user = { id: decoded.id }; // ✅ Use `req.user` instead of `req.id`

    next(); // Proceed to next middleware
  } catch (error) {
    console.error("JWT Authentication Error:", error);
    return res.status(401).json({ message: "Unauthorized - Token error" });
  }
};

export default isAuthenticated;
