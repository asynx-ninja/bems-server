const mongoose = require("mongoose");
const TouristSpot = require("../models/MTouristSpotModel");

const { uploadPicDrive, deleteFileDrive, deletePicDrive, uploadFileDrive } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const GetTouristSpotInformation = async (req, res) => {
  try {
    const { brgy, archived } = req.query;

    const result = await TouristSpot.find({
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

const GetSpecificTouristInfo = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such tourist spot" });
    }

    const result = await TouristSpot.find({
      _id: id,
    });

    return !result
      ? res.status(400).json({ error: `No such tourist spot` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const AddTouristSpotInfo = async (req, res) => {
  try {
    const { body, files } = req; // 'files' instead of 'file' for multiple files
    const { name, details, brgy } = JSON.parse(body.touristspot);
    console.log(files);

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    // Process each file and upload it
    let images = [];
    for (let f = 0; f < files.length; f += 1) {
      const { id, name } = await uploadPicDrive(
        files[f],
        ReturnBrgyFormat(brgy),
        "T"
      );

      images.push({
        link: `https://drive.google.com/uc?export=view&id=${id}`,
        id,
        name,
      });
    }

    const result = await TouristSpot.create({
      name,
      details,
      brgy,
      image: images, // Store the array of banners
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

const UpdateTouristSpotInfo = async (req, res) => {
    try {
      const { id } = req.params;
      let { body, files } = req;
      let currentFiles = [];
      body = JSON.parse(JSON.stringify(req.body));
      let { saved, touristspot } = body;
  
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid tourist spot ID" });
      }
  
      if (saved !== undefined) {
        if (Array.isArray(saved)) {
          currentFiles = saved.map((item) => JSON.parse(item));
        } else {
          currentFiles.push(JSON.parse(saved));
        }
      }
  
      let fileArray = [...currentFiles];
      touristspot = JSON.parse(body.touristspot);
  
      const fullItem = touristspot.image;
      const toBeDeletedItems = compareArrays(fullItem, currentFiles);
  
      for (const item of toBeDeletedItems) {
        await deletePicDrive(item.id,  touristspot.brgy, "T");
      }
  
      if (files) {
        for (let f = 0; f < files.length; f += 1) {
          const { id, name } = await uploadPicDrive(files[f], touristspot.brgy, "T");
  
          const file = {
            link: `https://drive.google.com/uc?export=view&id=${id}`,     
            id,
            name,
          };
          fileArray.push(file);
        }
      }
  
      const result = await TouristSpot.findOneAndUpdate(
        { _id: id },
        {
          name: touristspot.name,
          details: touristspot.details,
          brgy: touristspot.brgy,
          image: fileArray,
        },
        { new: true }
      );
  
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  };
  

const ArchiveTouristSpot = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such information" });
    }

    const result = await TouristSpot.findOneAndUpdate(
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
  GetTouristSpotInformation,
  GetSpecificTouristInfo,
  AddTouristSpotInfo,
  UpdateTouristSpotInfo,
  ArchiveTouristSpot,
};