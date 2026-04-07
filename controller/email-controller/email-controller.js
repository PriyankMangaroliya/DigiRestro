const nodemailer = require("nodemailer");

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Professional image-less email template wrapper
 */
const wrapInBaseTemplate = (subject, content) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
            body { font-family: 'Nunito', sans-serif; background-color: #f4f7f6; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
            .header { background-color: #6b55fa; padding: 30px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 2px; text-transform: uppercase; }
            .content { padding: 40px; color: #333333; line-height: 1.6; font-size: 16px; }
            .content b { color: #6b55fa; }
            .footer { background-color: #eeeeee; padding: 20px; text-align: center; color: #777777; font-size: 13px; }
            .footer p { margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>DigiRestro</h1>
            </div>
            <div class="content">
                ${content}
                <p style="margin-top: 30px;">Thank you,<br><b>The DigiRestro Team</b></p>
            </div>
            <div class="footer">
                <p>© ${new Date().getFullYear()} DigiRestro. All Rights Reserved.</p>
                <p>Simple. Proper. Professional.</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

// Function to send email
module.exports = {
  sendEmail: async (to, subject, text, useTemplate = true) => {
    try {
      const htmlContent = useTemplate ? wrapInBaseTemplate(subject, text) : text;
      
      const mailOptions = {
        from: `"DigiRestro" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text.replace(/<[^>]*>?/gm, ''), // Plain text version (strips HTML)
        html: htmlContent,
      };

      await emailTransporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}`);
      return true;

    } catch (error) {
      console.error("Error sending email:", error);
      return false;
    }
  },
};
