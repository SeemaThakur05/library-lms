const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use("/api/auth", require("./Routes/authRoutes"));
app.use("/api/books", require("./Routes/bookRoutes"));
app.use("/api/issues", require("./Routes/issueRoutes"));
app.use("/api/members", require("./Routes/memberRoutes"));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err.message);
  });

app.get("/", (req, res) => {
  res.send("Library LMS Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});