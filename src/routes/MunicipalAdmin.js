const express = require("express");
const router = express.Router();

const {
    GetMunicipalAdmin,
    GetSpecificMunicipalAdmin,
    GetArchivedMunicipalAdmin,
    CreateMunicipalAdmin,
    UpdateMunicipalAdmin,
    ArchiveMunicipalAdmin,
} = require("../controllers/MunicipalAdminController");

const upload = require("../config/Multer");

router.get("/", GetMunicipalAdmin);
router.get("/specific/:id", GetSpecificMunicipalAdmin);
router.get("/showArchivedAdmin/", GetArchivedMunicipalAdmin);
router.post("/", CreateMunicipalAdmin);
router.patch("/", upload.single("file"), UpdateMunicipalAdmin);
router.patch("/archived/:id/:archived", ArchiveMunicipalAdmin);

module.exports = router;
