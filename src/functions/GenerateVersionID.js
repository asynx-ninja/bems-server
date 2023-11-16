const GenerateVersionID = (brgyName = "") => {
  let brgy = brgyName.toUpperCase();
  brgy = brgy.replace(/\s/g, "");

  // Format the date string to YYYYMMDD.
  const date = new Date();
  const philippineTime = date.toLocaleTimeString("en-PH", {
    hour12: false,
    format: "HH:mm:ss",
  });

  const todayDate = date
    .toISOString()
    .split("T")[0]
    .replace(/[A-Z\.:-]/g, "");
  const todayTime = philippineTime.replace(/[A-Z\.:-]/g, "");

  const dateStr = todayDate + todayTime;

  return `V-${dateStr}-${brgy}`;
};

module.exports = GenerateVersionID;
