require("dotenv").config(); // This should be at the top
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const excelRoutes = require("./Routes/excelRoute.js");

console.log("Email:", process.env.EMAIL);
console.log("Email Password:", process.env.EMAIL_PASSWORD);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Failed:", err));

// Routes
app.use("/api/excel", excelRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
