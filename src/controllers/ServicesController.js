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
    const { brgy, archived, approved, status, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    let query = {
      $and: [{ brgy: brgy }, { isArchived: archived }],
    };

    if (approved !== undefined) {
      query.$and.push({ isApproved: approved });
    }

    if (status && status.toLowerCase() !== "all") {
      query.$and.push({ status: status });
    }

    const totalServices = await Service.countDocuments(query);

    const result = await Service.find(query)
      .skip(skip)
      .limit(itemsPerPage);

    return !result
      ? res.status(400).json({ error: `No such service for Barangay ${brgy}` })
      : res.status(200).json({ result, pageCount: Math.ceil(totalServices / itemsPerPage) });
  } catch (err) {
    res.send(err.message);
  }
};

const GetServiceAndForm = async (req, res) => {
  try {
    const { service_id } = req.query;

    const result = await Service.aggregate([
      {
        $lookup: {
          from: "service_forms",
          localField: "service_id",
          foreignField: "service_id",
          as: "service_form",
        },
      },
      { $unwind: "$service_form" }, // $unwind used for getting data in object or for one record only
      {
        $match: {
          $and: [{ service_id: service_id }],
        },
      },
    ]);

    return !result
      ? res.status(400).json({ error: "No such Service Form" })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllBrgyService = async (req, res) => {
  try {
    const { archived } = req.query;

    const result = await Service.find({ isArchived: archived});

    if (result.length === 0) {
      return res.status(400).json({ error: "No services found." });
    }

    return res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllPenBrgyService = async (req, res) => {
  try {
    const { archived, status } = req.query;

    const result = await Service.find({ isArchived: archived, isApproved: status });

    if (result.length === 0) {
      return res.status(400).json({ error: "No services found." });
    }

    return res.status(200).json(result);
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

    console.log(saved, service);

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
          banner: banner === null ? service.collections.banner : banner,
          logo: logo === null ? service.collections.logo : logo,
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
  GetAllBrgyService,
  GetAllPenBrgyService,
  GetBrgyServiceBanner,
  CreateServices,
  UpdateServices,
  StatusService,
  ArchiveService,
  GetServiceAndForm,
};
