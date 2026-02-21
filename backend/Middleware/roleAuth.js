
import jwt from "jsonwebtoken";

const roleAuth = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access Denied",
      });
    }
    next();
  };
};

export default roleAuth;