const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // This MUST be an App Password
  },
});

/**
 * Sends a 6-digit OTP code to the user's email.
 */
exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: `"OakCred Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your OakCred Login Code: ${otp}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; background-color: #0d0d0d; color: #ffffff; padding: 40px; border-radius: 12px; max-width: 500px; margin: auto; border: 1px solid #262626;">
        <h2 style="color: #2D6A4F; font-size: 24px; margin-bottom: 20px;">OakCred Login Code</h2>
        <p style="font-size: 16px; color: #a3a3a3; line-height: 1.5;">Enter the following 6-digit code to verify your identity and access your credit workspace.</p>
        <div style="background-color: #1a1a1a; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0; border: 1px solid #333 text-decoration: none;">
          <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #ffffff;">${otp}</span>
        </div>
        <p style="font-size: 12px; color: #525252; margin-top: 20px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #262626; margin: 30px 0;" />
        <p style="font-size: 12px; color: #525252; text-align: center;">© ${new Date().getFullYear()} OakCred Platform. All rights reserved.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email.');
  }
};
