import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMPT_HOST,
  port: process.env.EMAIL_SMPT_PORT,
  auth: {
    user: process.env.EMAIL_SMPT_USER,
    pass: process.env.EMAIL_SMPT_PASSWORD,
  },
  secure: process.env.NODE_ENV === "production" ? true : false,
});

async function send(mailOptions) {
  await transporter.sendMail(mailOptions);
}

const email = {
  send,
};

export default email;
