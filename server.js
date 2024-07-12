require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// Import routes
const userRoutes = require("./routes/users");
const academyRoutes = require("./routes/academies");

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);

  next();
});

app.use("/api/users", userRoutes);
app.use("/api/academies", academyRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    // Listen for requests
    app.listen(process.env.PORT, () => {
      console.log(`Listening on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
