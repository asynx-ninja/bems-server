const ReturnBrgyFormat = (brgy) => {
  brgy = brgy.toUpperCase();
  switch (brgy) {
    case "SAN JOSE":
    case "SAN RAFAEL":
    case "SAN ISIDRO":
      return brgy.replace(/ /g, "_");
    default:
      return brgy;
  }
};

module.exports = ReturnBrgyFormat;
