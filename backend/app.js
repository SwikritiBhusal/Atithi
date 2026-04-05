
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.route.js";
import homestayRouter from "./routes/homestayRoutes.js";
import cookieParser from "cookie-parser";
import paymentRoutes from './routes/paymentRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import notificationRoutes from "./routes/notificationRoutes.js";

const app = express();

// CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API routes
app.get('/', (req, res) => res.send("API WORKING FINE SWIKRITI"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/homestay', homestayRouter);
app.use('/api/payment', paymentRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use("/api/notifications", notificationRoutes);


export default app;

