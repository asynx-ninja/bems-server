const mongoose = require("mongoose");

const Announcement = require("../models/AnnouncementsModel");
const GenerateID = require("../functions/GenerateID");

const {
  createBarangayFolder,
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
} = require("../utils/Drive");

const GetBarangayAnnouncement = async (req, res) => {
  try {
    const { brgy, archived, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const totalAnnouncements = await Announcement.countDocuments({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    });

    const result = await Announcement.find({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    })
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    const pageCount = Math.ceil(totalAnnouncements / itemsPerPage);

    return !result
      ? res
          .status(400)
          .json({ error: `No such Announcement for Barangay ${brgy}` })
      : res.status(200).json({ result, pageCount });
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllOpenBrgyAnnouncement = async (req, res) => {
  try {
    const { brgy, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = {
      $and: [
        { isArchived: false },
        { $or: [{ brgy: brgy }, { isOpen: true }] },
      ],
    };

    const totalAnnouncements = await Announcement.countDocuments(query);

    const result = await Announcement.find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    const pageCount = Math.ceil(totalAnnouncements / itemsPerPage);

    return !result
      ? res
          .status(400)
          .json({ error: `No such Announcement for Barangay ${brgy}` })
      : res.status(200).json({ result, pageCount });
  } catch (err) {
    res.send(err.message);
  }
};

const CreateAnnouncement = async (req, res) => {
  try {
    const { event_folder_id } = req.query;
    const { body, files } = req;
    const { title, details, date, brgy, isOpen } = JSON.parse(body.announcement);
    let fileArray = [];
    const event_id = GenerateID(title, brgy, "E");
    const folder_id = await createRequiredFolders(event_id, event_folder_id);

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

    const result = await Announcement.create({
      event_id,
      title,
      details,
      date,
      brgy,
      collections: {
        folder_id: folder_id,
        banner: bannerObject,
        logo: logoObject,
        file: remainingFiles,
      },
      isOpen,
      attendees: [],
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
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

const UpdateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    let { body, files } = req;
    let currentFiles = [];
    body = JSON.parse(JSON.stringify(req.body));
    let { saved, announcement } = body;
    let banner = null,
      logo = null;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such announcement" });
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
    announcement = JSON.parse(body.announcement);
    const folder_id = announcement.collections.folder_id;
    const fullItem = announcement.collections.file;
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

          await deleteFolderFiles(announcement.collections.banner.id, folder_id);
        } else if (files[f].originalname === "logo") {
          logo = {
            link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
            id,
            name,
          };

          await deleteFolderFiles(announcement.collections.logo.id, folder_id);
        } else {
          fileArray.push({
            link: `https://drive.google.com/file/d/${id}/view`,
            id,
            name,
          });
        }
      }
    }

    const result = await Announcement.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          title: announcement.title,
          details: announcement.details,
          date: announcement.date,
          collections: {
            folder_id,
            banner: banner === null ? announcement.collections.banner : banner,
            logo: logo === null ? announcement.collections.logo : logo,
            file: fileArray,
          },
          brgy: announcement.brgy,
          isOpen: announcement.isOpen,
        },
      },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const ArchiveAnnouncement = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such Announcement" });
    }

    const result = await Announcement.findOneAndUpdate(
      { _id: id },
      { $set: { isArchived: archived } },
      { returnOriginal: false, upsert: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetBrgyAnnouncementBanner = async (req, res) => {
  const { brgy } = req.params;

  const result = await Announcement.aggregate([
    { $match: { brgy: brgy, isArchived: false } },
    { $project: { _id: 0, banner: "$collections.banner.link" } },
  ]);

  return !result
    ? res
        .status(400)
        .json({ error: `No such Announcement for Barangay ${brgy}` })
    : res.status(200).json(result);
};

const UpdateAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, contact, brgy } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such Attendee" });
    }
    const result = await Announcement.findByIdAndUpdate(
      { _id: id },
      { $push: { attendees: { firstName, lastName, email, contact, brgy } } },
      { returnOriginal: false, upsert: true }
    );
    return !result
      ? res.status(400).json({ error: `No such Attendee for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetBarangayAnnouncement,
  GetAllOpenBrgyAnnouncement,
  CreateAnnouncement,
  UpdateAnnouncement,
  ArchiveAnnouncement,
  GetBrgyAnnouncementBanner,
  UpdateAttendees,
};
