const express = require("express");
const router = express.Router();
const upload = require("../config/Multer");


const { composePatawag, Respond, specPatawag, getAllPatawag, getSpecUserPatawag, GetStaffBlotter } = require("../controllers/BlotterController");

router.get("/", specPatawag);
router.get("/all_patawag", getAllPatawag);
router.get("/staffblotter", GetStaffBlotter);
router.get("/specific/patawag/", getSpecUserPatawag)
router.post("/", upload.array("files", 10), composePatawag);
router.patch("/", upload.array("files", 10), Respond)

module.exports = router;
