const mongoose = require("mongoose");

const Service = require("../models/ServicesModel");
const GenerateID = require("../functions/GenerateID");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const {
  createFolder,
  uploadFileDrive,
  deleteFileDrive,
} = require("../utils/Drive");

const GetBrgyService = async (req, res) => {
  try {
    const { brgy, archived } = req.query;

    const result = await Service.find({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    });

    return !result
      ? res.status(400).json({ error: `No such service for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetBrgyServiceBanner = async (req, res) => {
  try {
    const { brgy } = req.params;

    const result = await Service.aggregate([
      { $match: { brgy: brgy, isArchived: false } },
      { $project: { _id: 0, banner: "$collections.banner.link" } },
    ]);

    return !result
      ? res.status(400).json({ error: `No such service for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const CreateServices = async (req, res) => {
  try {
    const { body, files } = req;
    const { name, type, details, fee, brgy } = JSON.parse(body.service);

    let fileArray = [];

    const service_id = GenerateID(brgy, "S", type.toUpperCase());
    const folder_id = await createFolder(
      ReturnBrgyFormat(brgy),
      "S",
      service_id
    );

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadFileDrive(files[f], folder_id);

      fileArray.push({
        link:
          f === 0 || f === 1
            ? `https://drive.google.com/uc?export=view&id=${id}`
            : `https://drive.google.com/file/d/${id}/view`,
        id,
        name,
      });
    }

    const [banner, logo, ...remainingFiles] = fileArray;
    const bannerObject = Object.assign({}, banner);
    const logoObject = Object.assign({}, logo);

    const result = await Service.create({
      service_id,
      name,
      type,
      details,
      fee,
      brgy,
      collections: {
        folder_id: folder_id,
        banner: bannerObject,
        logo: logoObject,
        file: remainingFiles,
      },
      isApproved: "Pending",
    });

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const compareArrays = (array1, array2) => {
  const difference = array1.filter((object1) => {
    return !array2.some((object2) => {
      return Object.keys(object1).every((key) => {
        return object1[key] === object2[key];
      });
    });
  });
  return difference;
};

const UpdateServices = async (req, res) => {
  try {
    const { id } = req.params;
    let { body, files } = req;
    let currentFiles = [];
    body = JSON.parse(JSON.stringify(req.body));
    let { saved, service } = body;
    let banner = null,
      logo = null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such service" });
    }

    // Check if the currentFiles uploaded in this function backend is not empty
    // Meaning, there are files in the frontend
    if (saved !== undefined) {
      if (typeof body.saved === "object") {
        for (const item of saved) {
          const parsed = JSON.parse(item);
          currentFiles.push(parsed);
        }
      } else {
        const parsed = JSON.parse(saved);
        currentFiles.push(parsed);
      }
    }

    let fileArray = [...currentFiles];
    service = JSON.parse(body.service);
    const folder_id = service.collections.folder_id;
    const fullItem = service.collections.file;
    const toBeDeletedItems = compareArrays(fullItem, currentFiles);

    toBeDeletedItems.forEach(async (item) => {
      await deleteFileDrive(item.id, folder_id);
    });

    if (files) {
      for (let f = 0; f < files.length; f += 1) {
        const { id, name } = await uploadFileDrive(files[f], folder_id);

        if (files[f].originalname === "banner") {
          banner = {
            link: `https://drive.google.com/uc?export=view&id=${id}`,
            id,
            name,
          };

          await deleteFileDrive(service.collections.banner.id, folder_id);
        } else if (files[f].originalname === "logo") {
          logo = {
            link: `https://drive.google.com/uc?export=view&id=${id}`,
            id,
            name,
          };

          await deleteFileDrive(service.collections.logo.id, folder_id);
        } else {
          fileArray.push({
            link: `https://drive.google.com/file/d/${id}/view`,
            id,
            name,
          });
        }
      }
    }

    const result = await Service.findOneAndUpdate(
      { _id: id },
      {
        name: service.name,
        type: service.type,
        details: service.details,
        fee: service.fee,
        brgy: service.brgy,
        collections: {
          folder_id,
          banner: banner === null ? service.collections.banner[0] : banner,
          logo: logo === null ? service.collections.logo[0] : logo,
          file: fileArray,
        },
        isApproved: "Pending",
      },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const StatusService = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such service" });
    }

    const result = await Service.findOneAndUpdate(
      { _id: id },
      { $set: { isApproved: isApproved } },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const ArchiveService = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such service" });
    }

    const result = await Service.findOneAndUpdate(
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
  GetBrgyService,
  GetBrgyServiceBanner,
  CreateServices,
  UpdateServices,
  StatusService,
  ArchiveService,
};
