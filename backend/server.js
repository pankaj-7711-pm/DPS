import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js"
import userRoutes from "./routes/userRoutes.js"
import cors from "cors";
import path from "path";
dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

//routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/adminctrl", adminRoutes);
app.use("/api/v1/userctrl", userRoutes);

// app.get("/", (req, res) => {
//   res.send("<h1>Welcome to Document processing app</h1>");
// });



const port = process.env.PORT || 4000;

app.listen(port, console.log("server started in port 4000"));
