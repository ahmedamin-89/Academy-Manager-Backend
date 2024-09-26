require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

// Import routes
const userRoutes = require("./routes/users");
const academyRoutes = require("./routes/academies");
const teamRoutes = require("./routes/teams");
const playerRoutes = require("./routes/players");
const coachRoutes = require("./routes/coaches");
const trainingRoutes = require("./routes/trainings");
const eventRoutes = require("./routes/events");
const paymentRoutes = require("./routes/payments");

const app = express();

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);

  next();
});

app.use("/api/users", userRoutes);
app.use("/api/academies", academyRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/coaches", coachRoutes);
app.use("/api/trainings", trainingRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/payments", paymentRoutes);

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
