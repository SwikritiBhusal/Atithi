import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not Authorized. Login Again",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id) {
      return res.status(401).json({
        success: false,
        message: "Not Authorized. Login Again",
      });
    }

    req.user = { id: decoded.id, role: decoded.role };
    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message,
    });
  }
   //for admin
 


// const isAdmin = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;

//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(401).json({ message: "Authorization token missing" });
//     }

//     const token = authHeader.split(" ")[1];

//     // Verify token
//     const decoded = await jwt.verify(token, process.env.JWT_SECRET);

//     if (decoded.role !== "admin") {
//       return res.status(403).json({ message: "Admin access required" });
//     }

//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: "Invalid or expired token" });
//   }
// };



};

export default userAuth;
