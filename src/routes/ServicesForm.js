const express = require("express");
const router = express.Router();

const {
  GetServiceForm,
  CreateServiceForm,
} = require("../controllers/ServicesFormController");

const upload = require("../config/Multer");

router.get("/", GetServiceForm);
router.post("/", CreateServiceForm);
// router.patch("/:id", upload.array("files", 10), UpdateServices);
// router.patch("/status/:id", StatusService);
// router.patch("/archived/:id/:archived", ArchiveService);

module.exports = router;
