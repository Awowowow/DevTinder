const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./middlewares/errorHandler");

app.use(
  cors({
    origin: ["http://13.60.209.63", "http://localhost:5173"],
    credentials: true,
  })
); 
app.use(express.json());
app.use(cookieParser());

// Routes - AFTER everything else 
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use(errorHandler);

connectDB()
  .then(() => {
    console.log("✅ Database connected");
    app.listen(7777, () => {
      console.log("✅ Server running on http://localhost:7777");
    });
  })
  .catch((err) => {
    console.error("❌ Database failed:", err);
  });

