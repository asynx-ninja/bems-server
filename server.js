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
const BrgyAdminRoutes = require("./src/routes/BrgyAdmin");
const MAboutusRoute = require("./src/routes/MAboutus");
const MServicesRoute = require("./src/routes/MServices");
const MTouristSpot = require("./src/routes/MTouristSpot");
const NotificationRoutes = require("./src/routes/Notification");
const AnnouncementFormRoutes = require("./src/routes/AnnouncementForm");
const EventsApplicationRoutes = require("./src/routes/EventsApplication");
const CountCompletedRoutes = require("./src/routes/EventsApplication");
const FolderRoute = require("./src/routes/Folder");
const DocumentRoute = require("./src/routes/Document");
const MunicipalAdminRoute = require("./src/routes/MunicipalAdmin")
const BlotterRoutes = require("./src/routes/Blotter")
const DocumentBlotterRoutes = require("./src/routes/DocumentBlotter")
const ActivityLogs = require("./src/routes/ActivityLog")
const connectDB = require("./src/config/DB");
const SocketIO = require("./src/config/SocketIO")

dotenv.config();

// Connect to DB
connectDB();
const app = express();
const server = SocketIO(app)

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  })
);
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret, Authorization"
  );
  console.log(req.path, req.method);
  next();
});

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
app.use("/api/mofficials", MunicipalityOfficialsRoutes);
app.use("/api/brgy_admin", BrgyAdminRoutes);
app.use("/api/aboutus", MAboutusRoute);
app.use("/api/services_info", MServicesRoute);
app.use("/api/tourist_spot", MTouristSpot);
app.use("/api/notification", NotificationRoutes);
app.use("/api/event_form", AnnouncementFormRoutes);
app.use("/api/application", EventsApplicationRoutes);
app.use("/api/completed", CountCompletedRoutes);
app.use("/api/folder", FolderRoute);
app.use("/api/document", DocumentRoute);
app.use("/api/municipal_admin", MunicipalAdminRoute);
app.use("/api/blotter", BlotterRoutes)
app.use("/api/blotter_documents", DocumentBlotterRoutes)
app.use("/api/act_logs", ActivityLogs)

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to Barangay E-Services Management System's API",
    usage: [
      "GET /api/services for managing services of barangay",
      "GET /api/requests for managing requests of barangay",
      "GET /api/forms for managing service forms of barangay",
      "GET /api/auth for login system",
      "GET /api/users for manipulating user credentials",
      "GET /api/announcement for managing events of barangay",
      "GET /api/brgyinfo for managing barangay info of barangay",
      "GET /api/brgyofficial for managing barangay officials of barangay",
      "GET /api/inquiries for managing inquiries of barangay",
      "GET /api/staffs for managing barangay staffs/admins of barangay",
      "GET /api/mofficials for managing municipality officials",
      "GET /api/admin for managing municipality admins",
      "GET /api/aboutus for managing municipality about us information",
      "GET /api/services_info for managing municipality service info",
      "GET /api/tourist_spot for managing municipality tourist spot info",
      "GET /api/notification for managing notifications",
      "GET /api/event_form for managing event forms of barangay",
      "GET /api/application for managing event applications",
      "GET /api/completed for managing completed applications/requests",
      "GET /api/folder for managing folder creation of the barangay in google drive",
      "GET /api/document for managing document formats of barangay",
    ],
  });
});

server.listen(process.env.PORT, () =>
  console.log(`Server started on port ${process.env.PORT}`)
);
