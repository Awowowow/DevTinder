const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("./sesClient.js");

const VERIFIED_EMAILS = [
  "aaravchandel767@gmail.com",
];

const createSendEmailCommand = (toAddress, fromAddress, emailData) => {
  const { senderName, recipientName, status, profileUrl, acceptUrl } = emailData;
  
  const subject = status === "interested" 
    ? `${senderName} is interested in connecting with you!`
    : `${senderName} has updated their connection status`;

  const htmlBody = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Connection Request</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f5f5f5;">
        <tr>
          <td align="center" style="padding: 40px 20px;">

            <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
              
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                    DevConnect
                  </h1>
                  <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 14px;">
                    Building Professional Connections
                  </p>
                </td>
              </tr>

              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 600;">
                    ${status === "interested" ? "🎉 New Connection Request!" : "📢 Connection Update"}
                  </h2>
                  
                  <p style="margin: 0 0 20px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Hi <strong style="color: #1f2937;">${recipientName}</strong>,
                  </p>

                  <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    ${status === "interested" 
                      ? `<strong style="color: #667eea;">${senderName}</strong> is interested in connecting with you on DevConnect! They think you'd make a great addition to their professional network.`
                      : `<strong style="color: #667eea;">${senderName}</strong> has sent you a connection request.`
                    }
                  </p>

                  ${status === "interested" ? `
                  <table role="presentation" style="width: 100%; margin: 30px 0;">
                    <tr>
                      <td align="center">
                        <a href="${acceptUrl || '#'}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                          View Request & Respond
                        </a>
                      </td>
                    </tr>
                  </table>
                  ` : ''}

                  <table role="presentation" style="width: 100%; background-color: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <tr>
                      <td>
                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                          Who's interested?
                        </p>
                        <p style="margin: 0; color: #1f2937; font-size: 18px; font-weight: 600;">
                          ${senderName}
                        </p>
                        ${profileUrl ? `
                        <p style="margin: 10px 0 0 0;">
                          <a href="${profileUrl}" style="color: #667eea; text-decoration: none; font-size: 14px; font-weight: 500;">
                            View Full Profile →
                          </a>
                        </p>
                        ` : ''}
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    Don't want to connect? No problem! You can ignore or decline this request from your notifications.
                  </p>
                </td>
              </tr>

              <tr>
                <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                    Stay connected with DevConnect
                  </p>
                  <p style="margin: 0 0 15px 0; color: #9ca3af; font-size: 12px;">
                    This email was sent to ${toAddress}
                  </p>
                  <p style="margin: 0; color: #9ca3af; font-size: 11px;">
                    © 2026 DevConnect. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textBody = `
Hi ${recipientName},

${status === "interested" 
  ? `${senderName} is interested in connecting with you on DevConnect!`
  : `${senderName} has sent you a connection request.`
}

${status === "interested" && acceptUrl 
  ? `View and respond to this request: ${acceptUrl}`
  : 'Check your DevConnect notifications to respond.'
}

Best regards,
The DevConnect Team

---
This email was sent to ${toAddress}
© 2026 DevConnect. All rights reserved.
  `;

  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: htmlBody,
        },
        Text: {
          Charset: "UTF-8",
          Data: textBody,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject,
      },
    },
    Source: fromAddress,
    ReplyToAddresses: [],
  });
};

const run = async (toAddress, fromAddress, emailData) => {
  // Check if recipient email is verified in sandbox
  if (!VERIFIED_EMAILS.includes(toAddress)) {
    console.log(`Email skipped - ${toAddress} not verified in SES sandbox`);
    return { skipped: true, reason: 'Email not verified in sandbox' };
  }

  const sendEmailCommand = createSendEmailCommand(
    toAddress,
    fromAddress,
    emailData
  );

  try {
    const result = await sesClient.send(sendEmailCommand);
    console.log(`✅ Email sent successfully to ${toAddress}`);
    return result;
  } catch (caught) {
    console.error(`❌ Failed to send email to ${toAddress}:`, caught.message);
    if (caught instanceof Error && caught.name === "MessageRejected") {
      return caught;
    }
    throw caught;
  }
};

module.exports = { run };