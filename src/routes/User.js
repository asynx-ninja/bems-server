const express = require("express");
const router = express.Router();

const {
  GetUsers,
  GetAllRegistered,
  GetPerBrgyRegistered,
  GetAllBrgyResident,
  GetAdminUsers,
  GetArchivedAdminUsers,
  GetSpecificUser,
  GetArchivedUsers,
  CreateUser,
  UpdateUser,
  StatusUser,
  ArchiveUser,
  getAllResidentIsArchived,
  UpdateVerification,
} = require("../controllers/UserController");

const upload = require("../config/Multer");

router.get("/", GetUsers);
router.get("/allregistered", GetAllRegistered);
router.get("/all_brgy_resident", GetAllBrgyResident);
router.get("/brgy_registered", GetPerBrgyRegistered);
router.get("/brgy_resident_isArchived", getAllResidentIsArchived);
router.get("/admin", GetAdminUsers);
router.get("/showArchivedAdmin", GetArchivedAdminUsers);
router.get("/specific/:id", GetSpecificUser);
router.get("/showArchived/", GetArchivedUsers);
router.post("/", upload.array("files", 10), CreateUser);
router.patch("/", upload.single("file"), UpdateUser);
router.patch("/verification", upload.array("files", 20), UpdateVerification);
router.patch("/status/:id", StatusUser);
router.patch("/archived/:id/:archived", ArchiveUser);

module.exports = router;
