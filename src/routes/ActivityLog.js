const express = require("express");
const router = express.Router();

const upload = require("../config/Multer");

const {
    GetActivityLog,
    AddActLog,
} = require("../controllers/ActivityLogController");

router.get("/", GetActivityLog);
router.post("/add_logs/", AddActLog);

module.exports = router;
