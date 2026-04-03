 // Load env variables
require("dotenv").config();

const express = require("express");
const app = express();

// Routes
const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payment");
const contactUsRoute = require("./routes/ContactUs");
const aiRoutes = require("./routes/AI");
const quizRoutes = require("./routes/Quiz");
const discussionRoutes = require("./routes/Discussion");
const certificateRoutes = require("./routes/Certificate");
const announcementRoutes = require("./routes/Announcement");
const adminRoutes = require("./routes/Admin");
const notificationRoutes = require("./routes/Notification");
const assignmentRoutes = require("./routes/Assignment");
const paymentHistoryRoutes = require("./routes/PaymentHistory");

// Config
const database = require("./config/database");
const { cloudinaryConnect } = require("./config/cloudinary");

// Middleware
const cookieParser = require("cookie-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");

// Server PORT
// console.log(process.env.PORT);
const PORT = process.env.PORT || 4000;

// Connect DB
database.connect();

// Cloudinary Setup
cloudinaryConnect();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // your react aapp
    credentials: true, 
  })
);

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

// Mount Routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/contact", contactUsRoute);
app.use("/api/v1/ai", aiRoutes);
app.use("/api/v1/quiz", quizRoutes);
app.use("/api/v1/discussion", discussionRoutes);
app.use("/api/v1/certificate", certificateRoutes);
app.use("/api/v1/announcement", announcementRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/notification", notificationRoutes);
app.use("/api/v1/assignment", assignmentRoutes);
app.use("/api/v1/payment-history", paymentHistoryRoutes);
// Default route
app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Your server is up and running...",
  });
});

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "This route does not exist",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`App is running at http://localhost:${PORT}`);
});

