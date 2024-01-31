const mongoose = require("mongoose");

const MunicipalityOfficial = require("../models/MunicipalityOfficialsModel");

const { uploadPicDrive, deletePicDrive, uploadFolderFiles, deleteFolderFiles } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const GetMunicipalityOfficial = async (req, res) => {
  try {
    const { brgy, archived, page, position } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    // Initialize the query as an empty object
    const query = {};

    if (position && position.toLowerCase() !== "all") {
      query.position = position;
    }

    const result = await MunicipalityOfficial.find({
      $and: [{ brgy: brgy }, { isArchived: archived }, query],
    })
      .skip(skip)
      .limit(itemsPerPage);

    const totalOfficials = await MunicipalityOfficial.countDocuments({
      $and: [{ brgy: brgy }, { isArchived: archived }, query],
    });

    const pageCount = Math.ceil(totalOfficials / itemsPerPage);

    return result
      ? res.status(200).json({ result, pageCount })
      : res.status(400).json({ error: `No officials found for Municipality ${brgy}` });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const AddMunicipalityOfficial = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { brgy } = req.query;
    const { body, file } = req;
    const {
      firstName,
      lastName,
      middleName,
      suffix,
      details,
      position,
      fromYear,
      toYear,
    } = JSON.parse(body.official);

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { id, name } = await uploadFolderFiles(file, folder_id);

    const picture = {
      link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
      id,
      name,
    };

    const result = await MunicipalityOfficial.create({
      brgy,
      picture,
      firstName,
      lastName,
      middleName,
      suffix,
      details,
      position,
      fromYear,
      toYear,
    });

    return res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const UpdateMunicipalityOfficial = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { brgy, doc_id } = req.query;
    const { body, file } = req;

    // Parse the official details from the request body
    const official = JSON.parse(body.official);
    const {
      picture,
      firstName,
      lastName,
      middleName,
      suffix,
      details,
      position,
      fromYear,
      toYear,
    } = official;

    let id = null,
    name = null;

    if (!mongoose.Types.ObjectId.isValid(doc_id)) {
      return res.status(400).json({ error: "No such official" });
    }

    if (file) {
      const obj = await uploadFolderFiles(file, folder_id);
      id = obj.id;
      name = obj.name;

      if (picture.id !== "") {
        await deleteFolderFiles(picture.id, folder_id);
      }
    }

    const result = await MunicipalityOfficial.findByIdAndUpdate(
      {
        _id: doc_id,
      },
      {
        $set: {
          firstName,
          lastName,
          middleName,
          suffix,
          details,
          position,
          fromYear,
          toYear,
          picture: file
            ? {
                id,
                name,
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
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

    const result = await MunicipalityOfficial.findOneAndUpdate(
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
  GetMunicipalityOfficial,
  AddMunicipalityOfficial,
  UpdateMunicipalityOfficial,
  ArchiveOfficial,
};
