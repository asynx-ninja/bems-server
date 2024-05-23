const express = require("express");
const router = express.Router();

const {
  GetBrgyService,
  SearchBrgyServices,
  GetAllBrgyService,
  GetAllApprovedBrgyService,
  GetAllPenBrgyService,
  GetBrgyServiceBanner,
  CreateServices,
  UpdateServices,
  StatusService,
  ArchiveService,
  GetServiceAndForm,
  getAllServices
} = require("../controllers/ServicesController");

const upload = require("../config/Multer");

router.get("/", GetBrgyService);
router.get("/search", SearchBrgyServices);
router.get("/allservices", GetAllBrgyService);
router.get("/approved_services", GetAllApprovedBrgyService);
router.get("/pendingservices", GetAllPenBrgyService);
router.get("/specific_service", GetServiceAndForm);
router.get("/get_distinct_services/", getAllServices);
router.get("/banner/:brgy", GetBrgyServiceBanner);
router.post("/", upload.array("files", 10), CreateServices);
router.patch("/:id", upload.array("files", 10), UpdateServices);
router.patch("/status/:id", StatusService);
router.patch("/archived/:id/:archived", ArchiveService);

module.exports = router;
