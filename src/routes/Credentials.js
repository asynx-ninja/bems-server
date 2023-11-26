const express = require("express");
const router = express.Router();

const {
  GetCredentials,
  UpdateCredentials,
  UpdatePasswordOnly,
  SentPIN,
  CheckPIN,
} = require("../controllers/CredentialsController");

router.get("/check_pin/:email/:pin", CheckPIN);
router.get("/:username/:password", GetCredentials);
router.patch("/send_pin/:email", SentPIN);
router.patch("/pass", UpdatePasswordOnly);
router.patch("/:id", UpdateCredentials);

module.exports = router;
