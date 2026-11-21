import transporter from "../config/mailer.js";  
import env from "../config/env.js";
import otpEMailtemplate from "../templates/otpEMail.template.js";


export const sendOtp = async (userEmail: string, userName: string, otp: string) => {

    const info = await transporter.sendMail({
      from: `Locked In Circle ${env.userEmail}`, 
      to: userEmail, 
      subject: "OTP VERIFICATION CODE", 
      html: otpEMailtemplate(userName, otp),

    });

    if (info.accepted.length === 0 || info.rejected.length > 0) {
      throw new Error(
        `SMTP did not accept the OTP email: ${info.response || "recipient rejected"}`,
      );
    }

    return info;
}