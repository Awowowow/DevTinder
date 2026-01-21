require('dotenv').config();
const { SESClient } = require("@aws-sdk/client-ses");

const REGION = "ap-south-1";

console.log('SES CONFIG:', {
  accessKey: !!process.env.AWS_ACCESS_KEY,
  secretKey: !!process.env.AWS_SECRET_KEY,
  region: REGION,
  accessKeyPreview: process.env.AWS_ACCESS_KEY?.substring(0, 10) + '...',
});

const sesClient = new SESClient({ 
  region: REGION, 
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

module.exports = { sesClient };