const BrgyKeys = require("../utils/FolderKeys.json");

const ReturnBarangay = (brgyName, type) => {
  if (BrgyKeys.hasOwnProperty(brgyName)) {
    switch (type) {
      case "M":
        return BrgyKeys[brgyName].root;
      case "E":
        return BrgyKeys[brgyName].events;
      case "R":
        return BrgyKeys[brgyName].request;
      case "S":
        return BrgyKeys[brgyName].service;
      case "U":
        return BrgyKeys[brgyName].pfp;
      case "O":
        return BrgyKeys[brgyName].official;
      case "I":
        return BrgyKeys[brgyName].info;
      case "Q":
        return BrgyKeys[brgyName].inquiries;
      case "A":
        return BrgyKeys[brgyName].aboutus;
      case "SI":
        return BrgyKeys[brgyName].services;
      case "T":
        return BrgyKeys[brgyName].touristspot;
    }
  } else return null;
};

module.exports = ReturnBarangay;
