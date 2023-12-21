const mongoose = require("mongoose");
const HomepageInformation = require("../models/MAboutusInfoModel");

const { uploadPicDrive, deletePicDrive } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const GetAboutusInformation = async (req, res) => {
  try {
    const { brgy, archived } = req.query;

    const result = await HomepageInformation.find({
      $and: [{ brgy: brgy }, { isArchived: archived }],
    });

    return result
      ? res.status(200).json(result)
      : res
          .status(400)
          .json({ error: `No officials found for Municipality ${brgy}` });
  } catch (err) {
    res.status(500).send(err.message);
  }
};
const GetAllAboutusInfo = async (req, res) => {
  try {
    // Retrieve logo, barangay name, and banner link
    const allinfo = await HomepageInformation.aggregate([
      {
        $project: {
          _id: 0,
          brgy: 1,
          mission: 1,
          story: 1,
          vision: 1,
          banner: "$banner.link",
          logo: "$logo.link",
        },
      }, // Project the desired fields
    ]);

    // Send successful response with the retrieved data
    res.status(200).json(allinfo);

    // Log the first document
    console.log("aa", allinfo);

    // Check if no barangays found
    if (allinfo.length === 0) {
      return res.status(400).json({ error: "No barangays found." });
    }
  } catch (error) {
    // Handle errors and send error response
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const AddAboutusInfo = async (req, res) => {
  try {
    const { body, file } = req;
    const { title, details, brgy } = JSON.parse(body.aboutusinfo);

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { id, name } = await uploadPicDrive(file, ReturnBrgyFormat(brgy), "H");

    const banner = {
      link: `https://drive.google.com/uc?export=view&id=${id}`,
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
    const { doc_id } = req.query;
    const { body, file } = req;

    const aboutusInfos = JSON.parse(body.aboutusInfo);

    if (!mongoose.Types.ObjectId.isValid(doc_id)) {
      return res.status(400).json({ error: "Invalid ID" });
    }

    let id = null,
      name = null;

    if (file) {
      const obj = await uploadPicDrive(file, aboutusInfos.brgy, "H");
      id = obj.id;
      name = obj.name;

      if (aboutusInfos.banner.id !== "")
        await deletePicDrive(aboutusInfos.banner.id, aboutusInfos.brgy, "H");
    }
    const result = await HomepageInformation.findOneAndUpdate(
      { _id: doc_id },
      {
        $set: {
          title: aboutusInfos.title,
          details: aboutusInfos.details,
          banner: file
            ? {
                link: `https://drive.google.com/uc?export=view&id=${id}`,
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

module.exports = {
  GetAboutusInformation,
  GetAllAboutusInfo,
  AddAboutusInfo,
  UpdateAboutusInfo,
};
