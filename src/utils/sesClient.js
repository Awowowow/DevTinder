const { SESClient } = require("@aws-sdk/client-ses");

const REGION = "ap-south-1";

const sesClient = new SESClient({ region: REGION, 
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_KEY,
    },
 });

 console.log("SES CONFIG:", {
    accessKey: !!process.env.AWS_ACCESS_KEY,
    secretKey: !!process.env.AWS_SECRET_KEY,
    region: REGION,
    sandbox: process.env.SES_SANDBOX_MODE,
  });
module.exports = { sesClient }; 