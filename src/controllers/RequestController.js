const mongoose = require("mongoose");
const Request = require("../models/RequestModel");
const GenerateID = require("../functions/GenerateID");
const ReturnBrgyFormat = require("../functions/ReturnBrgyFormat");

const {
  createBarangayFolder,
  createRequiredFolders,
  uploadFolderFiles,
  deleteFolderFiles,
} = require("../utils/Drive");

const GetAllRequest = async (req, res) => {
  try {
    const { brgy, archived, id, status, type, page } = req.query;
    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    let query = {
      $and: [{ brgy: brgy }, { isArchived: archived }],
    };

    if (id !== undefined) {
      query.$and.push({ _id: id });
    }

    if (type !== undefined && type !== "all") {
      query.$and.push({ service_name: type }); // Assuming the field is named 'service_name'
    }
    if (status && status.toLowerCase() !== "all") {
      query.status = status;
    }
    const totalRequests = await Request.countDocuments(query);

    const result = await Request.find(query)
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    return !result
      ? res.status(400).json({ error: `No such request for Barangay ${brgy}` })
      : res
          .status(200)
          .json({ result, pageCount: Math.ceil(totalRequests / itemsPerPage) });
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const GetStatusPercentage = async (req, res) => {
  try {
    const statusCountsByBarangay = await Request.aggregate([
      {
        $group: {
          _id: { brgy: "$brgy", status: "$status" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.brgy",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          brgy: "$_id",
          statuses: 1,
        },
      },
    ]);

    res.json(statusCountsByBarangay);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const GetAllPenReq= async (req, res) => {
  try {
    const { isArchived, page, brgy } = req.query;
    const itemsPerPage = 5; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const query = {
      brgy,
      isArchived: isArchived,
      status: "Pending",
    };

    const totalRequest = await Request.countDocuments(query);

    const result = await Request.find(query).skip(skip).limit(itemsPerPage);

    if (result.length === 0) {
      return res.status(400).json({ error: "No services found." });
    }

    return res
      .status(200)
      .json({ result, pageCount: Math.ceil(totalRequest / itemsPerPage) });
  } catch (err) {
    res.send(err.message);
  }
};

const GetCountPenReq= async (req, res) => {
  try {
    const { isArchived, brgy } = req.query;
    const query = {
      brgy,
      isArchived: isArchived,
      status: "Pending",
    };
    const result = await Request.find(query);
    if (result.length === 0) {
      return res.status(400).json({ error: "No services found." });
    }
    return res
      .status(200)
      .json({ result});
  } catch (err) {
    res.send(err.message);
  }
};

const GetRevenue = async (req, res) => {
  try {
    let matchCondition = { status: "Transaction Completed" };

    // Extract query parameters
    const { timeRange, month, year } = req.query;

    // Adjust match condition based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          matchCondition.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (req.query.week) {
            const weekDate = new Date(req.query.week);
            // Set to the start of the week (e.g., Monday)
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Adjust depending on how your week is defined (Sunday or Monday as start)
            weekStart.setUTCHours(0, 0, 0, 0);

            // Set to the end of the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // 6 days later
            weekEnd.setUTCHours(23, 59, 59, 999);

            matchCondition.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed
            const endOfMonth = new Date(year, month, 0); // Get the last day of the month

            matchCondition.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;

        case "annual":
          if (req.query.year) {
            const startYear = new Date(req.query.year, 0, 1); // January 1st
            const endYear = new Date(req.query.year, 11, 31); // December 31st
            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;
        case "specific":
          if (req.query.specificDate) {
            const specificDate = new Date(req.query.specificDate);
            // Ensure the date is set to the beginning of the day in UTC
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            matchCondition.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
        default:
        // Handle default case or throw an error
      }
    }

    const feeSummary = await Request.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$brgy", totalFee: { $sum: "$fee" } } },
    ]);

    res.json(feeSummary);
  } catch (error) {
    res.status(500).send(error);
  }
};

const GetEstRevenue = async (req, res) => {
  try {
    let matchCondition = {
      status: { $in: ["Processing", "Paid", "Transaction Completed"] },
      brgy: {
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
    };

    // Extract query parameters
    const { timeRange, date, week, month, year } = req.query;

    // Adjust match condition based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          matchCondition.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (req.query.week) {
            const weekDate = new Date(req.query.week);
            // Set to the start of the week (e.g., Monday)
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Adjust depending on how your week is defined (Sunday or Monday as start)
            weekStart.setUTCHours(0, 0, 0, 0);

            // Set to the end of the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // 6 days later
            weekEnd.setUTCHours(23, 59, 59, 999);

            matchCondition.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed
            const endOfMonth = new Date(year, month, 0); // Get the last day of the month

            matchCondition.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;
        case "annual":
          if (req.query.year) {
            const startYear = new Date(req.query.year, 0, 1); // January 1st
            const endYear = new Date(req.query.year, 11, 31); // December 31st
            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "specific":
          if (req.query.specificDate) {
            const specificDate = new Date(req.query.specificDate);
            // Ensure the date is set to the beginning of the day in UTC
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            matchCondition.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
          break;
        default:
        // Handle default case or throw an error
      }
    }

    const summary = await Request.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$brgy", totalFee: { $sum: "$fee" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).send(error);
  }
};

const GetRevenueBrgy = async (req, res) => {
  try {
    let matchCondition = { status: { $in: ["Transaction Completed", "Paid"] } };

    // Extract query parameters
    const { timeRange, date, week, month, year, brgy } = req.query;

    // Add a condition for a specific barangay
    if (brgy) {
      matchCondition.brgy = brgy;
    }

    // Adjust match condition based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          matchCondition.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (req.query.week) {
            const weekDate = new Date(req.query.week);
            // Set to the start of the week (e.g., Monday)
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Adjust depending on how your week is defined (Sunday or Monday as start)
            weekStart.setUTCHours(0, 0, 0, 0);

            // Set to the end of the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // 6 days later
            weekEnd.setUTCHours(23, 59, 59, 999);

            matchCondition.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed
            const endOfMonth = new Date(year, month, 0); // Get the last day of the month

            matchCondition.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;

        case "annual":
          if (year) {
            const startYear = new Date(year, 0, 1); // January 1st of the specified year
            const endYear = new Date(year, 11, 31); // December 31st of the specified year

            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "annual":
          if (req.query.year) {
            const startYear = new Date(req.query.year, 0, 1); // January 1st
            const endYear = new Date(req.query.year, 11, 31); // December 31st
            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "specific":
          if (req.query.specificDate) {
            const specificDate = new Date(req.query.specificDate);
            // Ensure the date is set to the beginning of the day in UTC
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            matchCondition.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
          break;

        default:
        // Handle default case or throw an error
      }
    }

    const feeSummary = await Request.aggregate([
      { $match: matchCondition }, // Include status condition
      { $group: { _id: "$brgy", totalFee: { $sum: "$fee" } } },
    ]);

    console.log("ha Summary:", feeSummary);

    res.json(feeSummary);
  } catch (error) {
    res.status(500).send(error);
  }
};

const GetEstRevenueBrgy = async (req, res) => {
  try {
    let matchCondition = {
      status: { $in: ["Processing", "Paid", "Transaction Completed"] },
    };

    // Extract query parameters
    const { timeRange, date, week, month, year, brgy } = req.query;

    // Add a condition for a specific barangay
    if (brgy) {
      matchCondition.brgy = brgy;
    }

    // Adjust match condition based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          matchCondition.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (req.query.week) {
            const weekDate = new Date(req.query.week);
            // Set to the start of the week (e.g., Monday)
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Adjust depending on how your week is defined (Sunday or Monday as start)
            weekStart.setUTCHours(0, 0, 0, 0);

            // Set to the end of the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // 6 days later
            weekEnd.setUTCHours(23, 59, 59, 999);

            matchCondition.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed
            const endOfMonth = new Date(year, month, 0); // Get the last day of the month

            matchCondition.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;
        case "annual":
          if (req.query.year) {
            const startYear = new Date(req.query.year, 0, 1); // January 1st
            const endYear = new Date(req.query.year, 11, 31); // December 31st
            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "specific":
          if (req.query.specificDate) {
            const specificDate = new Date(req.query.specificDate);
            // Ensure the date is set to the beginning of the day in UTC
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            matchCondition.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
          break;
        default:
        // Handle default case or throw an error
      }
    }

    const summary = await Request.aggregate([
      { $match: matchCondition },
      { $group: { _id: "$brgy", totalFee: { $sum: "$fee" } } },
      { $sort: { _id: 1 } },
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getTotalAvailedServices = async (req, res) => {
  try {
    let matchCondition = {
      status: {
        $in: ["Transaction Completed", "Processing", "Pending", "Paid"],
      },
    };

    // Extract query parameters
    const { timeRange, date, week, month, year, brgy } = req.query;

    // Add a condition for a specific barangay
    if (brgy) {
      matchCondition.brgy = brgy;
    }

    // Adjust match condition based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          matchCondition.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (req.query.week) {
            const weekDate = new Date(req.query.week);
            // Set to the start of the week (e.g., Monday)
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Adjust depending on how your week is defined (Sunday or Monday as start)
            weekStart.setUTCHours(0, 0, 0, 0);

            // Set to the end of the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // 6 days later
            weekEnd.setUTCHours(23, 59, 59, 999);

            matchCondition.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed
            const endOfMonth = new Date(year, month, 0); // Get the last day of the month

            matchCondition.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;

        case "annual":
          if (year) {
            const startYear = new Date(year, 0, 1); // January 1st of the specified year
            const endYear = new Date(year, 11, 31); // December 31st of the specified year

            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "annual":
          if (req.query.year) {
            const startYear = new Date(req.query.year, 0, 1); // January 1st
            const endYear = new Date(req.query.year, 11, 31); // December 31st
            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "specific":
          if (req.query.specificDate) {
            const specificDate = new Date(req.query.specificDate);
            // Ensure the date is set to the beginning of the day in UTC
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            matchCondition.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
          break;

        default:
        // Handle default case or throw an error
      }
    }

    const serviceSummary = await Request.aggregate([
      {
        $match: matchCondition,
      },
      {
        $group: {
          _id: "$service_name",
          totalRequests: { $sum: 1 },
          totalFee: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "$status",
                    ["Transaction Completed", "Processing", "Paid"],
                  ],
                },
                "$fee",
                0,
              ],
            },
          },
        },
      },
    ]);

    // Check if serviceSummary is empty
    if (serviceSummary.length === 0) {
      // If there are no services, return zero and the specified message
      return res.json({ totalRequests: 0, totalFee: 0, message: "No Availed Service for that time period" });
    }

    res.json(serviceSummary);
  } catch (error) {
    res.status(500).send(error);
  }
};

const getTotalStatusRequests = async (req, res) => {
  try {
    let matchCondition = {
      status: {
        $in: [
          "Pending",
          "Paid",
          "Processing",
          "Cancelled",
          "Transaction Completed",
          "Rejected",
        ],
      },
    };

    // Extract query parameters
    const { brgy } = req.query;

    // console.log("brgy:", brgy);

    // Add a condition for a specific barangay
    if (brgy) {
      matchCondition.brgy = brgy;
    }

    // console.log("matchCondition:", matchCondition);

    const serviceSummary = await Request.aggregate([
      {
        $match: matchCondition,
      },
      {
        $group: {
          _id: "$status",
          totalRequests: { $sum: 1 },
        },
      },
    ]);

    // console.log("serviceSummary:", serviceSummary);

    res.json(serviceSummary);
  } catch (error) {
    console.error("Error in getTotalStatusRequests:", error);
    res.status(500).send(error);
  }
};

const getTotalCompletedRequests = async (req, res) => {
  try {
    let matchCondition = { status: "Transaction Completed" };

    // Extract query parameters
    const { timeRange, date, week, month, year, brgy } = req.query;

    // Add a condition for a specific barangay
    if (brgy) {
      matchCondition.brgy = brgy;
    }

    // Adjust match condition based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          matchCondition.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (req.query.week) {
            const weekDate = new Date(req.query.week);
            // Set to the start of the week (e.g., Monday)
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Adjust depending on how your week is defined (Sunday or Monday as start)
            weekStart.setUTCHours(0, 0, 0, 0);

            // Set to the end of the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // 6 days later
            weekEnd.setUTCHours(23, 59, 59, 999);

            matchCondition.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed
            const endOfMonth = new Date(year, month, 0); // Get the last day of the month

            matchCondition.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;

        case "annual":
          if (year) {
            const startYear = new Date(year, 0, 1); // January 1st of the specified year
            const endYear = new Date(year, 11, 31); // December 31st of the specified year

            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "specific":
          if (req.query.specificDate) {
            const specificDate = new Date(req.query.specificDate);
            // Ensure the date is set to the beginning of the day in UTC
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            matchCondition.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
        default:
        // Handle default case or throw an error
      }
    }

    const completedRequestsSummary = await Request.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: "$status",
          totalRequests: { $sum: 1 },
          totalFee: { $sum: "$fee" },
        },
      },
    ]);

    res.json(completedRequestsSummary);
  } catch (error) {
    res.status(500).send(error);
  }
};

const GetRequestByUser = async (req, res) => {
  try {
    const { user_id, page } = req.query;

    const itemsPerPage = 10; // Number of items per page
    const skip = (parseInt(page) || 0) * itemsPerPage;

    const totalEventsApplications = await Request.countDocuments({
      "form.user_id.value": user_id,
    });

    const result = await Request.find({
      "form.user_id.value": user_id,
    })
      .skip(skip)
      .limit(itemsPerPage)
      .sort({ createdAt: -1 });

    return !result
      ? res.status(400).json({ error: `No such event application` })
      : res.status(200).json({
          result,
          pageCount: Math.ceil(totalEventsApplications / itemsPerPage),
        });
  } catch (error) {
    console.log(error);
  }
};

const CreateRequest = async (req, res) => {
  try {
    const { request_folder_id } = req.query;
    const { body, files } = req;
    const newBody = JSON.parse(body.form);
    //console.log(newBody, files);

    const req_id = GenerateID(newBody.brgy, "R", newBody.name);
    const folder_id = await createRequiredFolders(req_id, request_folder_id);
    let fileArray = [];

    if (files) {
      for (let f = 0; f < files.length; f += 1) {
        const { id, name } = await uploadFolderFiles(files[f], folder_id);

        fileArray.push({
          link: files[f].mimetype.includes("image")
            ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
            : `https://drive.google.com/file/d/${id}/view`,
          id,
          name,
        });
      }
    }

    const result = await Request.create({
      req_id,
      service_id: newBody.service_id,
      service_name: newBody.name,
      type: newBody.service_type,
      fee: newBody.fee,
      form: newBody.form,
      file: fileArray.length > 0 ? fileArray : [],
      brgy: newBody.brgy,
      payment: {},
      response: [],
      version: newBody.version,
      folder_id: folder_id,
    });

    return res.status(200).json(result);
  } catch (err) {
    res.status(400).json(err.message);
  }
};

const RespondToRequest = async (req, res) => {
  try {
    const { req_id, user_type } = req.query;
    const { body, files } = req;

    const {
      sender,
      message,
      status,
      date,
      isRepliable,
      folder_id,
      last_sender,
      last_array,
    } = JSON.parse(body.response);

    let fileArray = [];

    if (!mongoose.Types.ObjectId.isValid(req_id)) {
      return res.status(400).json({ error: "No such request" });
    }

    if (files) {
      for (let f = 0; f < files.length; f++) {
        const { id, name } = await uploadFolderFiles(files[f], folder_id);

        fileArray.push({
          link: files[f].mimetype.includes("image")
            ? `https://drive.google.com/thumbnail?id=${id}&sz=w1000`
            : `https://drive.google.com/file/d/${id}/view`,
          id,
          name,
        });
      }
    }

    if (user_type) {
      await Request.findByIdAndUpdate(
        { _id: req_id },
        {
          $set: {
            [`response.${last_array}`]: {
              sender: last_sender.sender,
              message: last_sender.message,
              date: last_sender.date,
              file: last_sender.file,
              isRepliable: false,
            },
          },
        }
      );
    }

    const result = await Request.findByIdAndUpdate(
      { _id: req_id },
      {
        $push: {
          response: {
            sender: sender,
            message: message,
            date: date,
            file: fileArray.length > 0 ? fileArray : null,
            isRepliable: isRepliable,
          },
        },
        $set: {
          status: status,
        },
      },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const ArchiveRequest = async (req, res) => {
  try {
    const { id, archived } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such official" });
    }

    const result = await Request.findOneAndUpdate(
      { _id: id },
      { $set: { isArchived: archived } },
      { returnOriginal: false, upsert: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const GetRevenueBrgyPerServices = async (req, res) => {
  try {
    let matchCondition = {
      status: { $in: ["Transaction Completed", "Paid"] },
    };

    // Extract query parameters
    const { timeRange, date, week, month, year, brgy } = req.query;

    // Add a condition for a specific barangay
    if (brgy) {
      matchCondition.brgy = brgy;
    }

    // Adjust match condition based on the timeRange
    if (timeRange) {
      const today = new Date();
      switch (timeRange) {
        case "today":
          matchCondition.createdAt = {
            $gte: new Date(today.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(23, 59, 59, 999)),
          };
          break;
        case "weekly":
          if (req.query.week) {
            const weekDate = new Date(req.query.week);
            // Set to the start of the week (e.g., Monday)
            const weekStart = new Date(weekDate);
            weekStart.setDate(weekDate.getDate() - weekDate.getDay() + 1); // Adjust depending on how your week is defined (Sunday or Monday as start)
            weekStart.setUTCHours(0, 0, 0, 0);

            // Set to the end of the week
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6); // 6 days later
            weekEnd.setUTCHours(23, 59, 59, 999);

            matchCondition.createdAt = {
              $gte: weekStart,
              $lt: weekEnd,
            };
          }
          break;
        case "monthly":
          if (year && month) {
            const startOfMonth = new Date(year, month - 1, 1); // Month is 0-indexed
            const endOfMonth = new Date(year, month, 0); // Get the last day of the month

            matchCondition.createdAt = {
              $gte: startOfMonth,
              $lt: endOfMonth,
            };
          }
          break;

        case "annual":
          if (year) {
            const startYear = new Date(year, 0, 1); // January 1st of the specified year
            const endYear = new Date(year, 11, 31); // December 31st of the specified year

            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "annual":
          if (req.query.year) {
            const startYear = new Date(req.query.year, 0, 1); // January 1st
            const endYear = new Date(req.query.year, 11, 31); // December 31st
            matchCondition.createdAt = {
              $gte: startYear,
              $lt: endYear,
            };
          }
          break;

        case "specific":
          if (req.query.specificDate) {
            const specificDate = new Date(req.query.specificDate);
            // Ensure the date is set to the beginning of the day in UTC
            specificDate.setUTCHours(0, 0, 0, 0);
            const nextDay = new Date(specificDate);
            nextDay.setUTCDate(specificDate.getUTCDate() + 1);

            matchCondition.createdAt = {
              $gte: specificDate,
              $lt: nextDay,
            };
          }
          break;

        default:
        // Handle default case or throw an error
      }
    }

    const feeSummary = await Request.aggregate([
      { $match: matchCondition }, // Include status condition
      {
        $group: {
          _id: {
            brgy: "$brgy",
            service_name: "$service_name",
            status: "$status",
          },
          totalFee: { $sum: "$fee" },
        },
      },
      {
        $group: {
          _id: { brgy: "$_id.brgy", service_name: "$_id.service_name" },
          TransactionCompleted: {
            $sum: {
              $cond: [
                { $eq: ["$_id.status", "Transaction Completed"] },
                "$totalFee",
                0,
              ],
            },
          },
          Paid: {
            $sum: { $cond: [{ $eq: ["$_id.status", "Paid"] }, "$totalFee", 0] },
          },
        },
      },
    ]);

    console.log("Service Revenue Summary:", feeSummary);

     // Check if feeSummary is empty (no services and revenue)
     if (feeSummary.length === 0) {
      // Return zero revenue with a custom message
      return res.json({ brgy: "No Availed Service for that time period", service_name: "Zero", TransactionCompleted: 0, Paid: 0 });
    }

    // Return the actual feeSummary
    res.json(feeSummary);
  } catch (error) {
    res.status(500).send(error);
  }
};

module.exports = {
  GetAllRequest,
  GetStatusPercentage,
  GetRevenue,
  GetEstRevenue,
  GetRevenueBrgy,
  GetEstRevenueBrgy,
  getTotalStatusRequests,
  getTotalAvailedServices,
  getTotalCompletedRequests,
  GetRequestByUser,
  CreateRequest,
  RespondToRequest,
  ArchiveRequest,
  GetRevenueBrgyPerServices,
  GetAllPenReq,
  GetCountPenReq
};
