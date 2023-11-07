const express = require("express");
const router = express.Router();

const {
  GetUsers,
  GetSpecificUser,
  GetArchivedUsers,
  CreateUser,
  UpdateUser,
  StatusUser,
  ArchiveUser,
  UnArchiveUser,
} = require("../controllers/UserController");

const upload = require("../config/Multer");

router.get("/:brgy", GetUsers);
router.get("/specific/:id", GetSpecificUser);
router.get("/showArchived/:brgy", GetArchivedUsers);
router.post("/", CreateUser);
router.patch("/:doc_id", upload.single("file"), UpdateUser);
router.patch("/status/:id", StatusUser);
router.patch("/archived/:id/:archived", ArchiveUser);

module.exports = router;
