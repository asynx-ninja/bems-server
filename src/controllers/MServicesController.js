const mongoose = require("mongoose");
const ServicesInformation = require("../models/MServicesInfoModel");

const { uploadFolderFiles, deleteFolderFiles } = require("../utils/Drive");

const GetServicesInformation = async (req, res) => {
  try {
    const { brgy, archived } = req.query;

    const query = { brgy: brgy, isArchived: archived };

    const result = await ServicesInformation.find(query).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      result,
      pageCount: Math.ceil(result.length / 10),
      total: result.length, // Total count without pagination
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const AddServicesInfo = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { body, file } = req;
    const { name, details, brgy } = JSON.parse(body.servicesinfo);

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { id, name: filename } = await uploadFolderFiles(file, folder_id);

    const icon = {
      link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
      id,
      filename,
    };

    const result = await ServicesInformation.create({
      name,
      details,
      brgy,
      icon,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const UpdateServicesInfo = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { doc_id } = req.query;
    const { body, file } = req;

    const servicesInfos = JSON.parse(body.servicesinfo);

    if (!mongoose.Types.ObjectId.isValid(doc_id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    let id = null,
      name = null;

    if (file) {
      const obj = await uploadFolderFiles(file, folder_id);
      id = obj.id;
      name = obj.name;

      if (servicesInfos.icon.id !== "")
        await deleteFolderFiles(servicesInfos.icon.id, folder_id);
    }
    const result = await ServicesInformation.findOneAndUpdate(
      { _id: doc_id },
      {
        $set: {
          name: servicesInfos.name,
          details: servicesInfos.details,
          icon: file
            ? {
                link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                id,
                name,
              }
            : servicesInfos.icon,
        },
      },
      { new: true }
    );

    if (!result) {
      return res.status(400).json({ error: "Info is not updated" });
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
};

const ArchiveServicesInfo = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such information" });
    }

    const result = await ServicesInformation.findOneAndUpdate(
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
  GetServicesInformation,
  AddServicesInfo,
  UpdateServicesInfo,
  ArchiveServicesInfo,
};
