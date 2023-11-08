const mongoose = require("mongoose");

const User = require("../models/UserModel");
const BCrypt = require("../config/BCrypt");
const Send = require("../config/Nodemailer");
const GeneratePIN = require("../functions/GeneratePIN");

const GetCredentials = async (req, res) => {
  try {
    const { username, password, type } = req.params;

    const result = await User.find({ username: username }, { password: 1, type: 1, "address.brgy": 1 });

    if (result.length === 0 || !result) {
      return res.status(400).json({ error: `No such user` });
    }

    if (!(await BCrypt.compare(password, result[0].password))) {
      return res.status(400).json({ error: `Wrong password` });
    }

    if (type !== result[0].type)
      return res.status(400).json({ error: `Account didn't registered for this website. Contact admin for concern!` });

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const SentPIN = async (req, res) => {
  try {
    const { email } = req.params;

    const found = await User.find({ email: email });

    if (found.length === 0)
      return res.status(400).json({ error: "Email not registered!" });

    const code = GeneratePIN();

    const result = await Send(
      email,
      "Password Security Code",
      "4 Digit PIN",
      code
    );

    if (!result.response) return res.status(400).json({ error: "Error email" });

    const update = await User.findOneAndUpdate(
      { email: email },
      {
        $set: { pin: code },
      }
    );

    res.status(200).json(update);
  } catch (err) {
    res.send(err.message);
  }
};

// CHECK PIN
const CheckPIN = async (req, res) => {
  try {
    const { email, pin } = req.params;
    const result = await User.find(
      { $and: [{ email: email }, { pin: pin }] },
      "_id"
    );

    return result.length === 0
      ? res.status(400).json({ error: `No such user` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }

};

const UpdateCredentials = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password } = req.body.user;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "No such user" });
    }

    const result = await User.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          username: username,
          password: await BCrypt.hash(password),
        },
      },
      { new: true }
    );

    res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

const UpdatePasswordOnly = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await User.findOneAndUpdate(
      { email: email },
      {
        $set: {
          password: await BCrypt.hash(password),
        },
      },
      { new: true }
    );

    return !result
      ? res.status(400).json({ error: `No such user` })
      : res.status(200).json(result);
  } catch (err) {
    res.send(err.message);
  }
};

module.exports = {
  GetCredentials,
  SentPIN,
  CheckPIN,
  UpdateCredentials,
  UpdatePasswordOnly,
};
