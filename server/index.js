import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cookieParser from "cookie-parser";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import disagreementRoutes from "./routes/disagreementRoutes.js";

// ES Module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

connectDB();

const port = process.env.PORT || 5000;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve API routes
app.use("/api/users", userRoutes);
app.use("/api/disagreements", disagreementRoutes);

if (process.env.NODE_ENV === "production") {
  // Serve Next.js build
  app.use(express.static(path.join(__dirname, "../client/out")));

  // Catch-all to serve Next.js's index.html for any other route
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "../client/out", "index.html"))
  );
} else {
  // Serve marketing site in development
  app.use(express.static(path.join(__dirname, "../marketing")));
  app.get("/", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../marketing", "index.html"));
  });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));
