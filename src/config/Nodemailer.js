// SOURCE: https://www.youtube.com/watch?v=i4HZg2TufcM

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const dotenv = require("dotenv");

dotenv.config();

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.OAUTH_CLIENTID,
//   process.env.OAUTH_CLIENT_SECRET,
//   "https://developers.google.com/oauthplayground"
// );

// oAuth2Client.setCredentials({
//   access_token: process.env.OAUTH_ACCESS_TOKEN,
// });

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    // type: "OAuth2",
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
    // clientId: process.env.OAUTH_CLIENTID,
    // clientSecret: process.env.OAUTH_CLIENT_SECRET,
    // refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    // accessToken: oAuth2Client.getAccessToken(),
    // access_type: "offline",
  },
});

const FormatMail = (email, code) => {
  return `<div style="max-width: 48rem; margin-left: auto; margin-right: auto;">
      <div style="background: radial-gradient(at center top, rgb(64, 141, 81), rgb(41, 81, 65)); display: flex; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1.25rem; padding-right: 1.25rem; justify-content: space-between; align-items: center; ">
        <div style="text-align: center; margin: auto">
          <span style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">
            MUNICIPALITY OF RODRIGUEZ, RIZAL 
          </span>
          <br/>
          <span style="font-size: 0.875rem; font-weight: 500; color: #ffffff;">
                M.H. Del Pilar Road, Rodriguez 1860 Rizal.
          </span>
        </div>
      </div>
      <div
        style="padding-top: 1.25rem; padding-bottom: 1.25rem;">
        <h1 style="font-size: 1.5rem; line-height: 2rem; font-weight: 700; text-align: center; text-transform: uppercase;">
          Password Request Sent
        </h1>
        <p style="margin-top: 0.5rem; font-weight: 700;">
          Dear User,
        </p>
        <div style="text-align: justify;">
          <p style="margin-top: 0.75rem;">
            We received a request to access your Bagong Montalban Account
            through your email address,
            <span style="font-weight: 700;">${email}</span>
            
          </p>
          <p style="margin-top: 0.75rem;">Your account verification code is:</p>
          <div style="text-align: center; font-size: 3rem; font-weight: 700; height: 70px; margin: auto">
            ${code}
          </div>
          <p>
            If you did not request this code, it is possible that someone else
            is trying to access the Bagong Montalban account of
            <span style="font-weight: 700;"> ${email}</span>
          </p>
          <p style="margin-top: 0.5rem;">
            Your received this message because this email address is listed as
            the recovery email for the Bagong Montalban Account. If that is incorrect,
            please contact
            <span style="font-weight: 700;">services.montalban@gmail.com</span>
            to remove your email address from that Google Account.
          </p>
        </div>
        <p style="margin-top: 0.75rem; font-weight: 700;">
          Sincerely yours,
        </p>
        <p style="font-weight: 700; ">The Bagong Montalban team</p>
      </div>
      <div style="background: radial-gradient(at center top, rgb(64, 141, 81), rgb(41, 81, 65)); color: #ffffff; padding-top: 1rem; padding-bottom: 1rem; margin: auto; text-align: center;">
        © 2023 Bagong Montalban, Inc. All Rights Reserved.
      </div>
    </div>`;
};

const FormatSendEmail = (email, status) => {
  return `<div style="max-width: 48rem; margin-left: auto; margin-right: auto;">
      <div style="background: radial-gradient(at center top, rgb(64, 141, 81), rgb(41, 81, 65)); display: flex; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1.25rem; padding-right: 1.25rem; justify-content: space-between; align-items: center; ">
        <div style="text-align: center; margin: auto">
          <span style="font-size: 1.25rem; font-weight: 700; color: #ffffff;">
            MUNICIPALITY OF RODRIGUEZ, RIZAL 
          </span>
          <br/>
          <span style="font-size: 0.875rem; font-weight: 500; color: #ffffff;">
                M.H. Del Pilar Road, Rodriguez 1860 Rizal.
          </span>
        </div>
      </div>
      <div
        style="padding-top: 1.25rem; padding-bottom: 1.25rem;">
        <h1 style="font-size: 1.5rem; line-height: 2rem; font-weight: 700; text-align: center; text-transform: uppercase;">
          ACCOUNT STATUS UPDATE
        </h1>
        <p style="margin-top: 0.5rem; font-weight: 700;">
          Dear User,
        </p>
        <div style="text-align: justify;">
          <p style="margin-top: 0.75rem;">
            Thank you for registering us in our Bagong Montalban Barangay E-Services Application
            <span style="font-weight: 700;">${email}</span>
          </p>
          <p style="margin-top: 0.75rem;">Your account status is now:</p>
          <div style="text-align: center; font-size: 3rem; font-weight: 700; height: 70px; margin: auto">
            ${status}
          </div>
          <p>
            If you have additional questions, please contact us through  
            <span style="font-weight: 700;">services.montalban@gmail.com </span>
            or you can message us through our Mobile and Web Application
          </p>
          <p style="margin-top: 0.5rem;">
            You received this message because this email address is listed as
            your email in signing up on our application.
        </div>
        <p style="margin-top: 0.75rem; font-weight: 700;">
          Sincerely yours,
        </p>
        <p style="font-weight: 700; ">The Bagong Montalban team</p>
      </div>
      <div style="background: radial-gradient(at center top, rgb(64, 141, 81), rgb(41, 81, 65)); color: #ffffff; padding-top: 1rem; padding-bottom: 1rem; margin: auto; text-align: center;">
        © 2023 Bagong Montalban, Inc. All Rights Reserved.
      </div>
    </div>`;
};

const Send = async (email, subject, text, code) => {
  try {
    const result = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: {
            name: "Bagong Montalban",
            address: process.env.MAIL_USERNAME,
          },
          to: email,
          subject: subject,
          text: text,
          html: FormatMail(email, code), // html body
        },
        (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(info);
            resolve(info);
          }
        }
      );
    });

    return result;
  } catch (err) {
    console.log(err);
  }
};

const sendEmail = async (email, subject, text, status) => {
  try {
    const result = await new Promise((resolve, reject) => {
      transporter.sendMail(
        {
          from: {
            name: "Bagong Montalban",
            address: process.env.MAIL_USERNAME,
          },
          to: email,
          subject: subject,
          text: text,
          html: FormatSendEmail(email, status), // html body
        },
        (err, info) => {
          if (err) {
            console.error(err);
            reject(err);
          } else {
            console.log(info);
            resolve(info);
          }
        }
      );
    });

    return result;
  } catch (err) {
    console.log(err);
  }
};


module.exports = {
  Send,
  sendEmail
};
