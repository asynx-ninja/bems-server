const mongoose = require("mongoose");

const BrgyOfficial = require("../models/BrgyOfficialModel");

const { uploadPicDrive, deletePicDrive } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const GetBarangayOfficial = async (req, res) => {
  try {
    const { brgy, archived } = req.query;

    const result = await BrgyOfficial.find({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    });

    return result.length > 0
      ? res.status(200).json(result)
      : res
          .status(400)
          .json({ error: `No officials found for Barangay ${brgy}` });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const AddBarangayOfficial = async (req, res) => {
  try {
    const { brgy } = req.query;
    const { body, file } = req;
    const { firstName, lastName, middleName, suffix, position, fromYear, toYear } = JSON.parse(body.official);

    var file_id = null,
      file_name = null;

    if (file) {
      const obj = await uploadPicDrive(file, ReturnBrgyFormat(brgy), "O");
      file_id = obj.id;
      file_name = obj.name;
    }

    const result = await BrgyOfficial.create({
      brgy,
      picture: file
        ? {
            link: `https://drive.google.com/uc?export=view&id=${file_id}`,
            id: file_id,
            name: file_name,
          }
        : {
            link: "",
            id: "",
            name: "",
          },
      firstName,
      lastName,
      middleName,
      suffix,
      position,
      fromYear,
      toYear,
    });

    return res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const UpdateBarangayOfficial = async (req, res) => {
  try {
    const { brgy, doc_id } = req.query;
    const { body, file } = req;

    // Parse the official details from the request body
    const official = JSON.parse(body.official);
    const { picture, firstName, middleName, lastName, suffix, position, fromYear, toYear } = official;

    var file_id = null,
      file_name = null;

    if (!mongoose.Types.ObjectId.isValid(doc_id)) {
      return res.status(400).json({ error: "No such official" });
    }

    if (file) {
      const obj = await uploadPicDrive(file, ReturnBrgyFormat(brgy), "O");
      file_id = obj.id;
      file_name = obj.name;

      if (picture.id !== "") {
        await deletePicDrive(picture.id, ReturnBrgyFormat(brgy), "O");
      }
    }

    const result = await BrgyOfficial.findByIdAndUpdate(
      {
        _id: doc_id,
      },
      {
        $set: {
          firstName,
          lastName,
          middleName,
          suffix,
          position,
          fromYear,
          toYear,
          picture: file
            ? {
                id: file_id,
                name: file_name,
                link: `https://drive.google.com/uc?export=view&id=${file_id}`,
              }
            : picture,
        },
      },
      { new: true }
    );

    return res.status(200).json(result);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

const ArchiveOfficial = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such official" });
    }

    const result = await BrgyOfficial.findOneAndUpdate(
      { _id: id },
      { $set: { isArchived: archived } },
      { returnOriginal: false, upsert: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetBarangayOfficial,
  AddBarangayOfficial,
  UpdateBarangayOfficial,
  ArchiveOfficial,
};
