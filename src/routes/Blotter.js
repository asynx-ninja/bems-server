const express = require("express");
const router = express.Router();



const { composePatawag, Respond, specPatawag } = require("../controllers/BlotterController");


router.get("/", specPatawag)
router.post("/", composePatawag);
router.post("/response", Respond)

module.exports = router;
