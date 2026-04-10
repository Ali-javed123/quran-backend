import connectDB from "../config/db.js";

export const dbMiddleware = async (req, res, next) => {
  await connectDB();
  next();
};