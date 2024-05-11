const express = require("express");
const router = express.Router();

const {
  GetAllServiceForm,
  CreateServiceForm,
  UpdateServiceForm,
  GetActiveForm,
} = require("../controllers/ServicesFormController");

router.get("/", GetAllServiceForm);
router.get("/check", GetActiveForm);
router.post("/", CreateServiceForm);
router.patch("/", UpdateServiceForm);

module.exports = router;
