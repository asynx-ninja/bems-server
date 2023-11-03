const express = require("express");
const router = express.Router();

const {
  GetUsers,
  GetArchivedUsers,
  CreateUser,
  UpdateUser,
  StatusUser,
  ArchiveUser,
  UnArchiveUser,
} = require("../controllers/UserController");

const upload = require("../config/Multer");

router.get("/:brgy", GetUsers);
router.get("/showArchived/:brgy", GetArchivedUsers);
router.post("/", CreateUser);
router.patch("/:doc_id", upload.single("files"), UpdateUser);
router.patch("/status/:id", StatusUser);
router.patch("/archived/:id", ArchiveUser);
router.patch("/unarchived/:id", UnArchiveUser);

module.exports = router;
