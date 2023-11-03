const { google } = require("googleapis");

const pkey = require("../utils/Credential.json");

const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

const jwtClient = new google.auth.JWT(
  pkey.client_email,
  null,
  pkey.private_key,
  SCOPES
);

jwtClient.authorize(function (err, tokens) {
  if (err) {
    return;
  } else {
    console.log("Google Autorization Complete");
  }
});

module.exports = jwtClient;