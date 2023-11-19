const express = require("express");
const router = express.Router();

const {
  GetAllServiceForm,
  CreateServiceForm,
  UpdateServiceForm
} = require("../controllers/ServicesFormController");

router.get("/", GetAllServiceForm);
router.post("/", CreateServiceForm);
router.patch("/", UpdateServiceForm);

module.exports = router;
