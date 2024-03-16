const mongoose = require("mongoose");
const Service = require("../models/ServicesModel");
const GenerateID = require("../functions/GenerateID");
const compareArrays = require("../functions/CompareArrays");

const {
  createBarangayFolder,
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles
} = require("../utils/Drive");

const GetBrgyService = async (req, res) => {
  try {
    const { brgy, archived, approved, status, page, type } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    let query = {
      $and: [{ brgy: brgy }, { isArchived: archived }],
    };

    if (approved !== undefined) {
      query.$and.push({ isApproved: approved });
    }

    if (status && status.toLowerCase() !== "all") {
      query.isApproved = status;
    }
    if (type && type.toLowerCase() !== "all") {
      query.type = type;
    }

    
    const totalServices = await Service.countDocuments(query);

    const result = await Service.find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    return !result
      ? res.status(400).json({ error: `No such service for Barangay ${brgy}` })
      : res
          .status(200)
          .json({ result, pageCount: Math.ceil(totalServices / itemsPerPage), total: totalServices });
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

    const result = await Service.find({ isArchived: archived });

    if (result.length === 0) {
      return res.status(400).json({ error: "No services found." });
    }

    return res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllApprovedBrgyService = async (req, res) => {
  try {
    const { timeRange, date, week, month, year } = req.query;
    const query = {
      isApproved: "Approved",
    };

    // Adjust the query based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          query.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (req.query.week) {
            const weekDate = new Date(req.query.week);
            // Set to the start of the week (e.g., Monday)
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Adjust depending on how your week is defined (Sunday or Monday as start)
            weekStart.setUTCHours(0, 0, 0, 0);

            // Set to the end of the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // 6 days later
            weekEnd.setUTCHours(23, 59, 59, 999);

            query.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed
            const endOfMonth = new Date(year, month, 0); // Get the last day of the month

            query.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;
        case "annual":
          if (req.query.year) {
            const startYear = new Date(req.query.year, 0, 1); // January 1st
            const endYear = new Date(req.query.year, 11, 31); // December 31st
            query.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "specific":
          if (req.query.specificDate) {
            const specificDate = new Date(req.query.specificDate);
            // Ensure the date is set to the beginning of the day in UTC
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            query.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
          break;
        default:
        // Handle default case or throw an error
      }
    }
    const result = await Service.find(query);

    res.json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllPenBrgyService = async (req, res) => {
  try {
    const { archived, status, page } = req.query;
    const itemsPerPage = 5; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = {
      isArchived: archived,
      isApproved: status,
    };

    const totalServices = await Service.countDocuments(query);

    const result = await Service.find(query)
      .skip(skip)
      .limit(itemsPerPage);

    return res.status(200).json({
      result,
      pageCount: Math.ceil(totalServices / itemsPerPage),
      total: totalServices,
    });
  } catch (err) {
    res.status(400).json(err.message);
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
    const { service_folder_id } = req.query;
    const { body, files } = req;
    const { name, type, details, fee, brgy } = JSON.parse(body.service);
    let fileArray = [];
    const service_id = GenerateID(name, brgy, "S");
    const folder_id = await createRequiredFolders(service_id, service_folder_id);

    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadFolderFiles(files[f], folder_id);

      fileArray.push({
        link:
          f === 0 || f === 1
            ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
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
      await deleteFolderFiles(item.id, folder_id);
    });

    if (files) {
      for (let f = 0; f < files.length; f += 1) {
        const { id, name } = await uploadFolderFiles(files[f], folder_id);

        if (files[f].originalname === "banner") {
          banner = {
            link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
            id,
            name,
          };

          await deleteFolderFiles(service.collections.banner.id, folder_id);
        } else if (files[f].originalname === "logo") {
          logo = {
            link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
            id,
            name,
          };

          await deleteFolderFiles(service.collections.logo.id, folder_id);
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
  GetAllApprovedBrgyService,
  GetAllPenBrgyService,
  GetBrgyServiceBanner,
  CreateServices,
  UpdateServices,
  StatusService,
  ArchiveService,
  GetServiceAndForm,
};
