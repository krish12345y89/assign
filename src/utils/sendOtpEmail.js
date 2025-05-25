import { config } from 'dotenv';
import nodemailer from 'nodemailer';
config();
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SENDER_MAIL, // your email
    pass: process.env.MAIL_PWD , // your app password
  },
});

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Your App" <${process.env.MAIL_USER}>`,
    to,
    subject: 'Your OTP Code',
    html: `<p>Your OTP is <strong>${otp}</strong></p>`,
  };

  await transporter.sendMail(mailOptions);
};

export default sendOtpEmail;
