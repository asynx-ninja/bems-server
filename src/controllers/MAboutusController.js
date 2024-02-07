const mongoose = require("mongoose");
const HomepageInformation = require("../models/MAboutusInfoModel");

const { uploadFolderFiles, deleteFolderFiles } = require("../utils/Drive");

const GetAboutusInformation = async (req, res) => {
  try {
    const { brgy, archived, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const totalInformation = await HomepageInformation.countDocuments({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    });

    const result = await HomepageInformation.find({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    })
      .skip(skip)
      .limit(itemsPerPage);

    const pageCount = Math.ceil(totalInformation / itemsPerPage);
    console.log(result);
    return result
      ? res.status(200).json({ result, pageCount })
      : res
          .status(400)
          .json({ error: `No officials found for Municipality ${brgy}` });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const AddAboutusInfo = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { body, file } = req;
    const { title, details, brgy } = JSON.parse(body.aboutusinfo);

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { id, name } = await uploadFolderFiles(file, folder_id);

    const banner = {
      link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
      id,
      name,
    };

    const result = await HomepageInformation.create({
      title,
      details,
      brgy,
      banner,
    });

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const UpdateAboutusInfo = async (req, res) => {
  try {
    const { folder_id } = req.query;
    const { doc_id } = req.query;
    const { body, file } = req;

    const aboutusInfos = JSON.parse(body.aboutusInfo);

    if (!mongoose.Types.ObjectId.isValid(doc_id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    let id = null,
      name = null;

    if (file !== undefined) {
      const obj = await uploadFolderFiles(file, folder_id);
      id = obj.id;
      name = obj.name;

      if (aboutusInfos.banner.id !== "")
        await deleteFolderFiles(aboutusInfos.banner.id, folder_id);
    }
    const result = await HomepageInformation.findOneAndUpdate(
      { _id: doc_id },
      {
        $set: {
          title: aboutusInfos.title,
          details: aboutusInfos.details,
          banner:
            file !== undefined
              ? {
                  link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
                  id,
                  name,
                }
              : aboutusInfos.banner,
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

const ArchiveAboutus = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such official" });
    }

    const result = await HomepageInformation.findOneAndUpdate(
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
  GetAboutusInformation,
  AddAboutusInfo,
  UpdateAboutusInfo,
  ArchiveAboutus,
};
