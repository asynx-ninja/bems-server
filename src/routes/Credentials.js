const express = require("express");
const router = express.Router();

const {
  GetCredentials,
  UpdateCredentials,
  UpdatePasswordOnly,
  SentPIN,
  CheckPIN
} = require("../controllers/CredentialsController");

router.get("/", GetCredentials);
router.get("/send_pin/:email", SentPIN);
router.get("/check_pin/:email/:pin", CheckPIN);
router.patch("/pass", UpdatePasswordOnly);
router.patch("/:id", UpdateCredentials);

module.exports = router;