import transporter from "../config/mailer.js";  
import env from "../config/env.js";
import otpEMailtemplate from "../templates/otpEMail.template.js";


export const sendOtp = async (userEmail: string, userName: string, otp: string) => {

    let info = await transporter.sendMail({
      from: `Abdulmuheez ${env.userEmail}`, 
      to: userEmail, 
      subject: "OTP VERIFICATION CODE", 
      html: otpEMailtemplate(userName, otp),

    });
}