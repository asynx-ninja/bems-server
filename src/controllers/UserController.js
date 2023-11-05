const mongoose = require("mongoose");

const User = require("../models/UserModel");
const GenerateID = require("../functions/GenerateID");

const {
  uploadPicDrive
} = require("../utils/Drive");


const GetUsers = async (req, res) => {
  const { brgy } = req.params;

  const result = await User.find({
    $and: [{ "address.brgy": brgy }, { isArchived: false }],
  });

  return !result
    ? res.status(400).json({ error: `No such user for Barangay ${brgy}` })
    : res.status(200).json(result);
};

const GetSpecificUser = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "No such user" });
  }
  const result = await User.find({
   _id: id
  });

  return !result
    ? res.status(400).json({ error: `No such user` })
    : res.status(200).json(result);
};

const GetArchivedUsers = async (req, res) => {
  const { brgy } = req.params;

  const result = await User.find({
    $and: [{ "address.brgy": brgy }, { isArchived: true }],
  });

  return !result
    ? res.status(400).json({ error: `No such user for Barangay ${brgy}` })
    : res.status(200).json(result);
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
      username,
      password,
    } = req.body;

    const user_id = GenerateID(address.brgy, "U", type.toUpperCase());

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
      profile: {},
      username,
      password,
      isApproved: "Pending",
    });

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const UpdateUser = async (req, res) => {
  try {
    const { doc_id } = req.params;
    let { body, file } = req;
    body = JSON.parse(JSON.stringify(body)); 
    const {users} = JSON.parse(body);
    console.log(users)

    // if (!mongoose.Types.ObjectId.isValid(doc_id)) {
    //   return res.status(400).json({ error: "No such user" });
    // }

    // var id = null,
    //   name = null;

    // if (file) {
    //   const obj = await uploadPicDrive(file, users.address.brgy, "U");
    //   console.log(users.address)
    //   id = obj.id;
    //   name = obj.name;
    // }

    // const result = await User.findOneAndUpdate(
    //   { _id: doc_id },
    //   {
    //     $set: {
    //       firstName: users.firstName,
    //       middleName: users.middleName, 
    //       lastName: users.lastName,
    //       suffix: users.suffix,
    //       religion: users.religion,
    //       email: users.email,
    //       birthday: users.birthday,
    //       birthplace: users.birthplace,
    //       age: users.age,
    //       contact: users.contact,
    //       sex: users.sex,
    //       address: users.address,
    //       occupation: users.occupation,
    //       civil_status: users.civil_status,
    //       type: users.type,
    //       isVoter: users.isVoter,
    //       isHead: users.isHead,
    //       profile: file
    //         ? {
    //             link: `https://drive.google.com/uc?export=view&id=${id}`,
    //             id,
    //             name,
    //           }
    //         : {},
    //     },
    //   },
    //   { new: true }
    // );

    // res.status(200).json(result);
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
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such user" });
    }

    const result = await Service.findOneAndUpdate(
      { _id: id },
      { $set: { isArchived: true } },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const UnArchiveUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such service" });
    }

    const result = await Service.findOneAndUpdate(
      { _id: id },
      { $set: { isArchived: false } },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetUsers,
  GetSpecificUser,
  GetArchivedUsers,
  CreateUser,
  UpdateUser,
  StatusUser,
  ArchiveUser,
  UnArchiveUser,
};
