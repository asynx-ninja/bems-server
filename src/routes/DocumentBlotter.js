const express = require("express");
const router = express.Router();

const {
  GetAllDocumentForm,
  CreateDocumentForm,
  UpdateDocumentForm
} = require("../controllers/DocumentBlotterController");

router.get("/", GetAllDocumentForm);
router.post("/", CreateDocumentForm);
router.patch("/", UpdateDocumentForm);

module.exports = router;
