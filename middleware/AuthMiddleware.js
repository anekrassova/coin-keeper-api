import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authMiddleware = (req, res, next) => {
  const jwtSecret = process.env.JWT_SECRET;

  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization validation failed" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Authorization validation failed" });
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Authorization validation failed" });
    }

    req.userId = decoded.id;
    req.email = decoded.email;

    next();
  });
};
