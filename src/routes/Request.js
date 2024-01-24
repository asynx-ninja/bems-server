const express = require("express");
const router = express.Router();

const {
  GetAllRequest,
  GetStatusPercentage,
  GetRevenue,
  GetEstRevenue,
  GetRequestByUser,
  CreateRequest,
  RespondToRequest,
  ArchiveRequest
} = require("../controllers/RequestController");

const upload = require("../config/Multer");

router.get("/specific/", GetRequestByUser);
router.get("/get_revenue", GetRevenue);
router.get("/est_revenue/", GetEstRevenue);
router.get("/status/percentage", GetStatusPercentage);
router.get("/", GetAllRequest);
router.post("/", upload.array("files", 10), CreateRequest);
router.patch("/", upload.array("files", 10), RespondToRequest);
router.patch("/archived/:id/:archived", ArchiveRequest);
module.exports = router;
