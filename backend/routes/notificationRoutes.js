import express from "express";
import userAuth from "../Middleware/auth.middleware.js";
import {
  getNotifications,
  markAsRead,
  markAllRead,
} from "../Controller/notificationController.js";

const router = express.Router();

router.get("/", userAuth, getNotifications);

router.put("/read/:id", userAuth, markAsRead);

router.put("/read-all", userAuth, markAllRead);

export default router;