const mongoose = require("mongoose");
const { hash } = require("../config/BCrypt");
const User = require("../models/UserModel");
const GenerateID = require("../functions/GenerateID");

const {
  createBarangayFolder,
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
} = require("../utils/Drive");

const GetBrgyAdmin = async (req, res) => {
  try {
    const { archived } = req.query;

    const query = {
      $and: [{ isArchived: archived }, { type: "Brgy Admin" }],
    };

    const result = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      result,
      pageCount: Math.ceil(result.length / 10),
      total: result.length, // Total count without pagination
    });
  } catch (err) {
    res.send(err.message);
  }
};

const GetSpecificBrgyAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such Barangay Admin" });
    }

    const result = await User.find({
      _id: id,
    });

    return !result
      ? res.status(400).json({ error: `No such Barangay Admin` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};



const CreateBrgyAdmin = async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      suffix,
      religion,
      email,
      birthday,
      age,
      contact,
      sex,
      address,
      occupation,
      civil_status,
      type,
      isVoter,
      isHead,
      isArchived,
      isApproved,
      username,
      password,
    } = req.body;

    const user_id = GenerateID("", address.brgy, "U");

    // Hash the password before saving
    const hashedPassword = await hash(password);

    const result = await User.create({
      user_id,
      firstName,
      middleName,
      lastName,
      suffix,
      religion,
      email,
      birthday,
      age,
      contact,
      sex,
      address,
      occupation,
      civil_status,
      type,
      isVoter,
      isHead,
      isArchived,
      profile: {},
      socials: {},
      username,
      password: hashedPassword, // Save the hashed password
      isApproved: isApproved,
    });

    res.status(200).json(result);
    console.log("hey", result)
  } catch (err) {
    console.log("hey", err)
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Username or email already existed" });
    }
    res.send(err.message);
  }
};

const UpdateBrgyAdmin = async (req, res) => {
  try {
    const { folder_id, doc_id } = req.query;
    const { body, file } = req;
    const user = JSON.parse(body.users);

    if (!mongoose.Types.ObjectId.isValid(doc_id)) {
      return res.status(400).json({ error: "No such user" });
    }

    var id = null,
      name = null;

    if (file) {
      const obj = await uploadFolderFiles(file, folder_id);
      id = obj.id;
      name = obj.name;

      if (user.profile.id !== "")
        await deleteFolderFiles(user.profile.id, folder_id);
    }

    const result = await User.findOneAndUpdate(
      { _id: doc_id },
      {
        $set: {
          firstName: user.firstName,
          middleName: user.middleName,
          lastName: user.lastName,
          suffix: user.suffix,
          religion: user.religion,
          email: user.email,
          username: user.username,
          birthday: user.birthday,
          birthplace: user.birthplace,
          age: user.age,
          contact: user.contact,
          sex: user.sex,
          address: user.address,
          occupation: user.occupation,
          civil_status: user.civil_status,
          type: user.type,
          isVoter: user.isVoter,
          isHead: user.isHead,
          profile: file
            ? {
              link: `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
              id,
              name,
            }
            : user.profile,
          socials: {
            facebook: {
              name: user.socials.facebook.name,
              link: user.socials.facebook.link,
            },
            instagram: {
              name: user.socials.instagram.name,
              link: user.socials.instagram.link,
            },
            twitter: {
              name: user.socials.twitter.name,
              link: user.socials.twitter.link,
            },
          },
        },
      },
      { new: true }
    );

    console.log("result", result);

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};


const GetArchivedBrgyAdmin = async (req, res) => {
  try {
    const { type } = req.query;

    const query = {
      $and: [{ isArchived: true }, { type: "Brgy Admin" }],
    };

    if (type && type.toLowerCase() !== "all") {
      query.type = type;
    }

    const totalStaffs = await User.countDocuments(query);

    const result = await User.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      result,
      pageCount: Math.ceil(result.length / 10),
      total: result.length, // Total count without pagination
    });
  } catch (err) {
    res.send(err.message);
  }
};

const ArchiveBrgyAdmin = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such Barangay Admin" });
    }

    const result = await User.findOneAndUpdate(
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
  GetBrgyAdmin,
  GetSpecificBrgyAdmin,
  GetArchivedBrgyAdmin,
  CreateBrgyAdmin,
  UpdateBrgyAdmin,
  ArchiveBrgyAdmin,
};
