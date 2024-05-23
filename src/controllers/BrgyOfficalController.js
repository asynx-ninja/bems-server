const mongoose = require("mongoose");

const BrgyOfficial = require("../models/BrgyOfficialModel");

const {
  createBarangayFolder,
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
} = require("../utils/Drive");

const GetBarangayOfficial = async (req, res) => {
  try {
    const { brgy, archived, position } = req.query;
    
    const query = { $and: [{ brgy: brgy }, { isArchived: archived }] };

    if (position && position.toLowerCase() !== "all") {
      query.$and.push({ position: position }); // Add position filter to the query
    }

    const totalOfficials = await BrgyOfficial.countDocuments(query);

    const result = await BrgyOfficial.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      result,
      pageCount: Math.ceil(result.length / 10),
      total: result.length, // Total count without pagination
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const GetBarangayChairman = async (req, res) => {
  try {
    const { brgy, archived} = req.query;

    const query = { $and: [{ brgy: brgy }, { isArchived: archived }, {position: "Barangay Chairman"}] };

    const result = await BrgyOfficial.find(query).sort({createdAt: -1 }); 

    return result.length > 0
      ? res.status(200).json({ result })
      : res.status(400).json({ error: `No officials found for Barangay ${brgy}` });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const AddBarangayOfficial = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { brgy } = req.query;
    const { body, file } = req;
    const { firstName, lastName, middleName, suffix, position, fromYear, toYear } = JSON.parse(body.official);

    var file_id = null,
      file_name = null;

    if (file) {
      const obj = await uploadFolderFiles(file, folder_id);
      file_id = obj.id;
      file_name = obj.name;
    }

    const result = await BrgyOfficial.create({
      brgy,
      picture: file
        ? {
            link: `https://drive.google.com/thumbnail?id=${file_id}&sz=w1000`,
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
    const { folder_id } = req.query;
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
      const obj = await uploadFolderFiles(file, folder_id);
      file_id = obj.id;
      file_name = obj.name;

      if (picture.id !== "") {
        await deleteFolderFiles(picture.id, folder_id);
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
                link: `https://drive.google.com/thumbnail?id=${file_id}&sz=w1000`,
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
  GetBarangayChairman,
  AddBarangayOfficial,
  UpdateBarangayOfficial,
  ArchiveOfficial,
};
