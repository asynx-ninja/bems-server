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

const GetUsers = async (req, res) => {
  try {
    const { brgy, status, page, type } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    let query = {
      $and: [{ "address.brgy": brgy }, { isArchived: false }],
    };

    // If status is provided and not "all", add it to the query
    if (status && status.toLowerCase() !== "all") {
      query.$and.push({ isApproved: status });
    }
    if (type && type.toLowerCase() !== "all") {
      query.$and.push({ type: type });
    }

    const result = await User.find(query).skip(skip).limit(itemsPerPage);

    const totalUsers = await User.countDocuments(query);

    const pageCount = Math.ceil(totalUsers / itemsPerPage);

    return !result
      ? res.status(400).json({ error: `No such user for Barangay ${brgy}` })
      : res.status(200).json({ result, pageCount });
  } catch (err) {
    res.send(err.message);
  }
};

const GetAllRegistered = async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  try {
    const userCount = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          type: "Resident", // Filter by user type
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" }, // Group by month
          totalUsers: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 }, // Sort by month
      },
    ]);
    res.json(userCount);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const GetPerBrgyRegistered = async (req, res) => {
  try {
    const { timeRange, date, week, month, year } = req.query;
    const query = {
      "address.brgy": {
        $in: [
          "BALITE",
          "BURGOS",
          "GERONIMO",
          "MACABUD",
          "MANGGAHAN",
          "MASCAP",
          "PURAY",
          "ROSARIO",
          "SAN ISIDRO",
          "SAN JOSE",
          "SAN RAFAEL",
        ],
      },
      type: "Resident",
      isApproved: "Registered",
    };

    // Adjust the query based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          query.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (week) {
            const weekDate = new Date(week);
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1);
            weekStart.setUTCHours(0, 0, 0, 0);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setUTCHours(23, 59, 59, 999);

            query.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0);

            query.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;
        case "annual":
          if (year) {
            const startYear = new Date(year, 0, 1);
            const endYear = new Date(year, 11, 31);

            query.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;
        case "specific":
          if (date) {
            const specificDate = new Date(date);
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            query.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
          break;
        default:
          // Handle default case or throw an error
          throw new Error("Invalid timeRange");
      }
    }

    const registeredResidents = await User.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$address.brgy",
          totalUsers: { $sum: 1 },
        },
      },
    ]);

    res.json(registeredResidents);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const GetAllBrgyResident = async (req, res) => {
  try {
    const { brgy } = req.query;

    if (!brgy) {
      return res.status(400).json({ error: "Barangay parameter is missing" });
    }

    const residentsInBrgy = await User.aggregate([
      {
        $match: {
          "address.brgy": brgy,
          type: "Resident",
        },
      },
      {
        $group: {
          _id: "$address.brgy",
          totalUsers: { $sum: 1 },
          residents: {
            $push: {
              _id: "$_id",
              name: "$name",
              status: {
                $cond: {
                  if: { $eq: ["$isApproved", "Registered"] },
                  then: "Registered",
                  else: {
                    $cond: {
                      if: { $eq: ["$isApproved", "Pending"] },
                      then: "Pending",
                      else: "Denied",
                    },
                  },
                },
              },
              isArchived: "$isArchived", // Include the isArchived field
            },
          },
        },
      },
    ]);
    res.json(residentsInBrgy);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const GetAdminUsers = async (req, res) => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.setDate(1); // Start from the first day of the 6th month ago

  try {
    const monthlyRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);
    res.json(monthlyRegistrations);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

const GetArchivedAdminUsers = async (req, res) => {
  try {
    const { brgy, page, type } = req.query;
    console.log("Received Admin Type:", type);
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = {
      $and: [{ "address.brgy": brgy }, { isArchived: true }],
    };

    // Conditionally add the type filter
    if (type && type.toLowerCase() !== "all") {
      query.$and.push({ type: type });
    }

    console.log("Query after Type Filter:", query);

    const result = await User.find(query).skip(skip).limit(itemsPerPage);

    const totalUsers = await User.countDocuments(query);

    const pageCount = Math.ceil(totalUsers / itemsPerPage);

    return !result
      ? res.status(400).json({ error: `No such user for Barangay ${brgy}` })
      : res.status(200).json({ result, pageCount });
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

    const result = await User.find(query).skip(skip).limit(itemsPerPage);

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
    const { folder_id } = req.query;
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

const getAllResidentIsArchived = async (req, res) => {
  try {
    const { brgy, isArchived } = req.query;

    if (!brgy) {
      return res.status(400).json({ error: "Barangay parameter is missing" });
    }

    const residentsIsArchived = await User.aggregate([
      {
        $match: {
          "address.brgy": brgy,
          type: "Resident",
          isArchived: isArchived
            ? isArchived === "true"
            : { $in: [false, null] },
        },
      },
      {
        $group: {
          _id: "$address.brgy",
          totalUsers: { $sum: 1 },
          residents: {
            $push: {
              _id: "$_id",
              name: "$name",
              isArchived: "$isArchived",
            },
          },
        },
      },
    ]);
    res.json(residentsIsArchived);
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

module.exports = {
  GetUsers,
  GetAllRegistered,
  GetPerBrgyRegistered,
  GetAllBrgyResident,
  GetAdminUsers,
  GetArchivedAdminUsers,
  GetSpecificUser,
  GetArchivedUsers,
  CreateUser,
  UpdateUser,
  StatusUser,
  ArchiveUser,
  getAllResidentIsArchived,
};
