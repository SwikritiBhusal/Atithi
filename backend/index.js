
import dotenv from "dotenv";
dotenv.config();
// initialization
import app from './app.js';
import mongoose from "mongoose";


const port = process.env.PORT || 5000;

// Routes
app.get('/', (_req, res) => {
    res.send("This is the Homepage.");
});

// starting the server
app.listen(port, () => {
    console.log(`Server started at Port: ${port}`);
    console.log("SMTP_USER =", process.env.SMTP_USER); // 🔍 DEBUG
});

// database connection
const uri = process.env.MONGO_URI;

const clientOptions = { serverApi: { version: '1', strict: true, deprecationErrors: true } };

async function run() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("MongoDB connected successfully!");
  } catch (err) {
    console.error(err);
  }
}

run();

