const mongoose = require("mongoose");
const { hash } = require("../config/BCrypt");
const User = require("../models/UserModel");
const GenerateID = require("../functions/GenerateID");

const { uploadPicDrive, deletePicDrive } = require("../utils/Drive");

const GetUsers = async (req, res) => {
  try {
    const { brgy, type, status, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    let query = {
      $and: [{ "address.brgy": brgy }, { type: type }, { isArchived: false }],
    };

    // If status is provided and not "all", add it to the query
    if (status && status.toLowerCase() !== "all") {
      query.$and.push({ isApproved: status });
    }

    const result = await User.find(query)
      .skip(skip)
      .limit(itemsPerPage);

    const totalUsers = await User.countDocuments(query);

    const pageCount = Math.ceil(totalUsers / itemsPerPage);

    return !result
      ? res.status(400).json({ error: `No such user for Barangay ${brgy}` })
      : res.status(200).json({ result, pageCount });
  } catch (err) {
    res.send(err.message);
  }
};


const GetAdminUsers = async (req, res) => {
  try {
    const { brgy } = req.query;

    const result = await User.find({
      $and: [{ "address.brgy": brgy },{ isArchived: false }],
    });

    return !result
      ? res.status(400).json({ error: `No such user for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetArchivedAdminUsers = async (req, res) => {
  try {
    const { brgy } = req.query;

    const result = await User.find({
      $and: [{ "address.brgy": brgy },{ isArchived: true }],
    });

    return !result
      ? res.status(400).json({ error: `No such user for Barangay ${brgy}` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetSpecificUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such user" });
    }

    const result = await User.find({
      _id: id,
    });

    return !result
      ? res.status(400).json({ error: `No such user` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetArchivedUsers = async (req, res) => {
  try {
    const { brgy, type, status, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    let query = {
      $and: [{ "address.brgy": brgy }, { type: type }, { isArchived: true }],
    };

    // If status is provided and not "all", add it to the query
    if (status && status.toLowerCase() !== "all") {
      query.$and.push({ isApproved: status });
    }

    const result = await User.find(query)
      .skip(skip)
      .limit(itemsPerPage);

    const totalUsers = await User.countDocuments(query);

    const pageCount = Math.ceil(totalUsers / itemsPerPage);

    return !result
      ? res.status(400).json({ error: `No such user for Barangay ${brgy}` })
      : res.status(200).json({ result, pageCount });
  } catch (err) {
    res.send(err.message);
  }
};


const CreateUser = async (req, res) => {
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

    const user_id = GenerateID(address.brgy, "U", type.toUpperCase());

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
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ error: "Username or email already existed" });
    }
    res.send(err.message);
  }
};

const UpdateUser = async (req, res) => {
  try {
    const { doc_id } = req.query;
    const { body, file } = req;
    const user = JSON.parse(body.users);

    console.log(user);

    if (!mongoose.Types.ObjectId.isValid(doc_id)) {
      return res.status(400).json({ error: "No such user" });
    }

    var id = null,
      name = null;

    if (file) {
      const brgy = user.address.brgy.replace(/ /g, "_");
      const obj = await uploadPicDrive(file, brgy, "U");
      id = obj.id;
      name = obj.name;

      if (user.profile.id !== "")
        await deletePicDrive(user.profile.id, brgy, "U");
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

const StatusUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such user" });
    }

    const result = await User.findOneAndUpdate(
      { _id: id },
      { $set: { isApproved: isApproved } },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const ArchiveUser = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such user" });
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
  GetUsers,
  GetAdminUsers,
  GetArchivedAdminUsers,
  GetSpecificUser,
  GetArchivedUsers,
  CreateUser,
  UpdateUser,
  StatusUser,
  ArchiveUser,
};
