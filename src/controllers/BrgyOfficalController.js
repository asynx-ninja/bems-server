const mongoose = require("mongoose");
const BrgyInformation = require("../models/BrgyInfoModel");

const { uploadPicDrive, deletePicDrive } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const GetBarangayOfficial = async (req, res) => {
  try {
    const { brgy } = req.query;

    const result = await BrgyInformation.find({ brgy: brgy });

    return !result
      ? res
          .status(400)
          .json({ error: `No such Information for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};


const AddBarangayOfficial = async (req, res) => {
  const { brgy } = req.query;
  const { body, file } = req;
  console.log(body, file)
  const { name, position, fromYear, toYear } = JSON.parse(body.official);

  var file_id = null,
    file_name = null;

  if (file) {
    const obj = await uploadPicDrive(file, ReturnBrgyFormat(brgy), "O");
    file_id = obj.id;
    file_name = obj.name;
  }

  const result = await BrgyInformation.findOneAndUpdate(
    { brgy: brgy },
    {
      $push: {
        officials: {
          picture: file
            ? {
                link: `https://drive.google.com/uc?export=view&id=${file_id}`,
                id: file_id,
                name: file_name,
              }
            : {
                link: "",
                id: "",
                name: "",
              },
          name,
          position,
          fromYear,
          toYear,
        },
      },
    },
    { new: true } 
  );

  return res.json(result);
};


const UpdateBarangayOfficial = async (req, res) => {
  const { doc_id } = req.query;
  const { body, file } = req;
  const { picture, name, position, fromYear, toYear } = JSON.parse(
    body.official
  );

  if (!mongoose.Types.ObjectId.isValid(doc_id)) {
    return res.status(400).json({ error: "No such user" });
  }

  var id = null,
    file_name = null;

  if (file) {
    const obj = await uploadPicDrive(file, ReturnBrgyFormat(brgy), "O");
    file_id = obj.id;
    file_name = obj.name;

    if (picture.id !== "") await deletePicDrive(picture.id, brgy, "O");
  }

  const result = await BrgyInformation.findOneAndUpdate(
    { brgy: brgy },
    {
      $set: {
        picture: file
          ? {
              link: `https://drive.google.com/uc?export=view&id=${id}`,
              id: file_id,
              name: file_name,
            }
          : picture,
        name,
        position,
        fromYear,
        toYear,
      },
    }
  );

  return res.json(result);
};

module.exports = {
   GetBarangayOfficial,
   AddBarangayOfficial,
   UpdateBarangayOfficial,
};
