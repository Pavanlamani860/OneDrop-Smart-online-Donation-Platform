const nodemailer = require("nodemailer");

const sendThankYouEmail = async (to, name, campaign, amount) => {
  try {
    console.log("📧 TO:", to);
    console.log("👤 NAME:", name);
    console.log("🎯 CAMPAIGN:", campaign);
    console.log("💰 AMOUNT:", amount);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"OneDrop" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Thank You for Your Donation ❤️",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2 style="color:#198754;">Thank You for Your Donation! ❤️</h2>

          <p>Hello <strong>${name}</strong>,</p>

          <p>
            Thank you for your generous contribution to
            <strong>${campaign}</strong>.
          </p>

          <p>
            <strong>Donation:</strong> ${amount}
          </p>

          <p>
            Your support helps us bring hope and assistance to those in need.
            Every contribution makes a difference.
          </p>

          <hr>

          <p>
            Regards,<br>
            <strong>Team OneDrop</strong>
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email send error:", error.message);
  }
};

module.exports = sendThankYouEmail;
