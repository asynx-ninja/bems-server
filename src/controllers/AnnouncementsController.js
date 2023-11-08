const mongoose = require("mongoose");
const Announcement = require("../models/AnnouncementsModel");
const GenerateID = require("../functions/GenerateID");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const {
  uploadFileDrive,
  createFolder,
  deleteFileDrive,
} = require("../utils/Drive");

const GetBarangayAnnouncement = async (req, res) => {
  const { brgy, archived } = req.query;

  const result = await Announcement.find({
    $and: [{ brgy: brgy }, { isArchived: archived }],
  });

  return !result
    ? res
        .status(400)
        .json({ error: `No such Announcement for Barangay ${brgy}` })
    : res.status(200).json(result);
};

const CreateAnnouncement = async (req, res) => {
  try {
    const { body, files } = req;
    const announcementData = JSON.parse(body.announcement);
    const { title, details, date, brgy } = announcementData;

    let fileArray = [];
    const event_id = GenerateID(brgy, "E");
    const folder_id = await createFolder(ReturnBrgyFormat(brgy), "E", event_id);

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

    const result = await Announcement.create({
      event_id,
      title,
      details,
      date,
      collections: {
        folder_id: folder_id,
        banner,
        logo,
        file: remainingFiles,
      },
      attendees: [],
      brgy,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    console.log(body, files);
    let currentFiles = [];
    body = JSON.parse(JSON.stringify(req.body));
    let { saved, announcement } = body;
    let banner = null,
      logo = null;
    console.log(saved, announcement);
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

          await deleteFileDrive(
            announcement.collections.banner[0].id,
            folder_id
          );
        } else if (files[f].originalname === "logo") {
          logo = {
            link: `https://drive.google.com/uc?export=view&id=${id}`,
            id,
            name,
          };

          await deleteFileDrive(announcement.collections.logo[0].id, folder_id);
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
            banner:
              banner === null ? announcement.collections.banner[0] : banner,
            logo: logo === null ? announcement.collections.logo[0] : logo,
            file: fileArray,
          },
          brgy: announcement.brgy,
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
    console.log(id, archived);
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
  CreateAnnouncement,
  UpdateAnnouncement,
  ArchiveAnnouncement,
  GetBrgyAnnouncementBanner,
  UpdateAttendees,
};
