const express = require("express");
const router = express.Router();

const {
  GetAllRequest,
  GetRequestByUser,
  CreateRequest,
  RespondToRequest,
  ArchiveRequest
} = require("../controllers/RequestController");

const upload = require("../config/Multer");

router.get("/specific/", GetRequestByUser);
router.get("/", GetAllRequest);
router.post("/", upload.array("files", 10), CreateRequest);
router.patch("/", upload.array("files", 10), RespondToRequest);
router.patch("/archived/:id/:archived", ArchiveRequest);
<<<<<<< HEAD
=======

>>>>>>> 5171a221bcca61cd4c9f18d574c0200de7a1fe0b
module.exports = router;
