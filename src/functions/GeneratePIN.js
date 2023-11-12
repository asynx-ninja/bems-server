const GeneratePIN = () => {
  // Generate a random number between 1000 and 9999.
  const randomNumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

  // Convert the random number to a string.
  const pinString = randomNumber.toString();

  // Pad the PIN string with leading zeros, if necessary.
  while (pinString.length < 4) {
    pinString = "0" + pinString;
  }

  // Return the 4-digit PIN.
  return pinString;
};

module.exports = GeneratePIN;
