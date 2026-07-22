import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import agreementRoutes from "./routes/agreementRoutes.js";
import fs from "fs";

dotenv.config();
connectDB();

if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

const app = express();
app.use(cors());
app.use(express.json());

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);

app.use("/api/auth", authRoutes);
app.use("/api/agreements", agreementRoutes);

app.get("/", (req, res) => res.json({ status: "API running" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
