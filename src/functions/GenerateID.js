const GenerateID = (title, brgyName = "", code) => {
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
  const firstCharacters = title.split(' ').map(word => word[0]).join('');

  switch (code) {
    // S-BALITE-BC-datestr
    // R-BALITE-BC-datestr
    // U-BALITE-dateStr
    // Q-BALITE-dateStr
    // E-BALITE-BC-dateStr
    // A-BALITE-BC-dateSTr
    case "E":
      return `E-${brgy}-${firstCharacters}-${dateStr}`;
    case "A":
      return `A-${brgy}-${firstCharacters}-${dateStr}`;
    case "S":
      return `S-${brgy}-${firstCharacters}-${dateStr}`;
    case "R":
      return `R-${brgy}-${firstCharacters}-${dateStr}`;
    case "U":
      return `U-${brgy}-${dateStr}`;
    case "Q":
      return `Q-${brgy}-${dateStr}`;
  }
};

module.exports = GenerateID;
