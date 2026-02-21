/*import express from "express";
dotenv.config();
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.route.js";

import dotenv from "dotenv";
import cookieParser from "cookie-parser";


const app = express();  // create express app
const port = process.env.PORT || 5000;
//connectDB();

// CORS setup to allow cookies and requests from frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,  // important to allow cookies
}));

// Parse JSON bodies
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// API endpoints
app.get('/', (req, res) => res.send("API WORKING FINE SWIKRITI"));
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);



export default app;*/

import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.route.js";
import homestayRouter from "./routes/homestayRoutes.js";
import cookieParser from "cookie-parser";

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



export default app;

