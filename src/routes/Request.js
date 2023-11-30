const express = require("express");
const router = express.Router();

const {
  GetAllRequest,
  CreateRequest,
  RespondToRequest
} = require("../controllers/RequestController");

const upload = require("../config/Multer");

router.get("/", GetAllRequest);
router.post("/", upload.array("files", 10), CreateRequest);
router.patch("/", upload.array("files", 10), RespondToRequest);

module.exports = router;
