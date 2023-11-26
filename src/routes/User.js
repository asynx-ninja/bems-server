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
} = require("../controllers/UserController");

const upload = require("../config/Multer");

router.get("/", GetUsers);
router.get("/specific/:id", GetSpecificUser);
router.get("/showArchived/", GetArchivedUsers);
router.post("/", CreateUser);
router.patch("/:doc_id", upload.single("file"), UpdateUser);
router.patch("/status/:id", StatusUser);
router.patch("/archived/:id/:archived", ArchiveUser);

module.exports = router;
