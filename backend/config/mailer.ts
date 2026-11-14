import nodemailer from "nodemailer";
import env from "./env.js";


// console.log("user:", env.smtpUser, "pass set:", !!env.smtpPass);

 let transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: env.smtpUser, // generated brevo user
      pass: env.smtpPass, // generated brevo password
    },
  });

  export default transporter