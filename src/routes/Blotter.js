const express = require("express");
const router = express.Router();
const upload = require("../config/Multer");


const { composePatawag, Respond, specPatawag } = require("../controllers/BlotterController");


router.get("/", specPatawag)
router.post("/", upload.array("files", 10), composePatawag);
router.post("/response", upload.array("files", 10), Respond)

module.exports = router;
