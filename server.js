const dotenv = require("dotenv");
const cors = require("cors");
const express = require("express");

const AnnouncementRoutes = require("./src/routes/Announcement");
const ServicesRoutes = require("./src/routes/Services");
const RequestRoutes = require("./src/routes/Request");
const ServicesFormRoutes = require("./src/routes/ServicesForm");
const CredentialsRoutes = require("./src/routes/Credentials");
const UserRoutes = require("./src/routes/User");
const BrgyInformationRoutes = require("./src/routes/BarangayInfo");
const BrgyOfficialRoutes = require("./src/routes/BrgyOfficial");
const BrgyInquiriesRoutes = require("./src/routes/Inquiries");
const StaffRoutes = require("./src/routes/Staff");
const MunicipalityOfficialsRoutes = require("./src/routes/MunicipalityOfficials");
const AdminRoutes = require("./src/routes/BrgyAdmin");

const connectDB = require("./src/config/DB");

dotenv.config();

// Connect to DB
connectDB();

const app = express();

// Middleware
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

// Routes
app.use("/api/services", ServicesRoutes);
app.use("/api/requests", RequestRoutes);
app.use("/api/forms", ServicesFormRoutes);
app.use("/api/auth", CredentialsRoutes);
app.use("/api/users", UserRoutes);
app.use("/api/announcement", AnnouncementRoutes);
app.use("/api/brgyinfo", BrgyInformationRoutes);
app.use("/api/brgyofficial", BrgyOfficialRoutes);
app.use("/api/inquiries", BrgyInquiriesRoutes);
app.use("/api/staffs", StaffRoutes);
app.use("/api/municipalityofficials", MunicipalityOfficialsRoutes);
app.use("/api/admin", AdminRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Barangay E-Services Management System's API",
    usage: [
      "GET /api/services for managing services of barangay",
      "GET /api/auth for login system",
      "GET /api/users for manipulating user credentials",
    ],
  });
});

app.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
