const express = require("express");
const router = express.Router();

const {
  GetAllRequest,
  CreateRequest,
} = require("../controllers/RequestController");

const upload = require("../config/Multer");

router.get("/", GetAllRequest);
router.post("/", upload.array("files", 50), CreateRequest);

module.exports = router;
