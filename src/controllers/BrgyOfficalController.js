const mongoose = require("mongoose");
const BrgyOfficial = require("../models/BrgyOfficialModel");

const { uploadPicDrive, deletePicDrive } = require("../utils/Drive");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const GetBarangayOfficial = async (req, res) => {
  try {
    const { brgy } = req.query;

    const result = await BrgyOfficial.find({ brgy: brgy });
   
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

  const { name, position, fromYear, toYear } = JSON.parse(body.official);

  var file_id = null,
    file_name = null;

  if (file) {
    const obj = await uploadPicDrive(file, ReturnBrgyFormat(brgy), "O");
    file_id = obj.id;
    file_name = obj.name;
  }

  const result = await BrgyOfficial.findOneAndUpdate(
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

const GetSpecificOfficial = async (req, res) => {
  try {
    const { brgy, id } = req.params;

    const result = await BrgyInformation.findOne({
      brgy: brgy,
      "officials._id": id,
    });

    if (!result || !result.officials || result.officials.length === 0) {
      return res
        .status(400)
        .json({ error: `No officials found for Barangay ${brgy}` });
    }

    const specificOfficial = result.officials.filter(
      (official) => official._id.toString() === id
    );

    if (!specificOfficial || specificOfficial.length === 0) {
      return res.status(404).json({ error: `No official found with ID ${id}` });
    }

    return res.status(200).json({ specificOfficial: specificOfficial[0] });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const UpdateBarangayOfficial = async (req, res) => {
  try {
    const { brgy, id } = req.params;
    console.log(brgy, id)

    const { updatedDetails } = req.body;

    const result = await BrgyInformation.findOne({
      brgy: brgy,
      "officials._id": id,
    });

    if (!result || !result.officials || result.officials.length === 0) {
      return res
        .status(400)
        .json({ error: `No officials found for Barangay ${brgy}` });
    }

    const updatedOfficials = result.officials.map((official) => {
      if (official._id.toString() === id) {
        // Update details within the specific official
        return {
          ...official,
          ...updatedDetails,
        };
      } else {
        return official;
      }
    });

    const updatedResult = await BrgyInformation.findOneAndUpdate(
      { 'officials._id': id },
      {
        $set: {
          officials: updatedOfficials,
        },
      },
      { new: true }
    );

    if (!updatedResult) {
      return res.status(404).json({ error: `No official found with ID ${id}` });
    }

    return res.status(200).json({ specificOfficial: updatedResult.officials.find(official => official._id.toString() === id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  GetBarangayOfficial,
  GetSpecificOfficial,
  AddBarangayOfficial,
  UpdateBarangayOfficial,
};
