const otpEMailtemplate = (userName: string, otp: string) => {
  if (!/^\d{6}$/.test(otp)) {
    throw new Error("OTP email template requires a six-digit code");
  }

  const digits = [...otp];

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no" />
  <title>Your Verification Code — Locked In Circle</title>

  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style>
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td, th, div, p, a, h1, h2, h3 { font-family: 'Segoe UI', Arial, sans-serif !important; }
  </style>
  <![endif]-->

  <style type="text/css">
    /* Reset & Client Normalization */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 100% !important;
      width: 100% !important;
      background-color: #f5f5f5;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }

    table, td {
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }

    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }

    a[x-apple-data-detectors],
    .unstyle-auto-detected-links a,
    .aBn {
      border-bottom: 0 !important;
      cursor: default !important;
      color: inherit !important;
      text-decoration: none !important;
      font-size: inherit !important;
      font-family: inherit !important;
      font-weight: inherit !important;
      line-height: inherit !important;
    }

    /* Interactive Button Hover (Supported Webmail & Apple Mail) */
    /* Interactive Button Hover (Preserving Exact #0a0a0a Palette) */
    .copy-btn {
      transition: opacity 0.2s ease, transform 0.15s ease;
    }
    .copy-btn:hover {
      opacity: 0.9 !important;
    }
    .copy-btn:active {
      transform: translateY(1px);
    }

    /* Selectable OTP Digits for Quick Tap-to-Select */
    .otp-digit {
      -webkit-user-select: all;
      -moz-user-select: all;
      -ms-user-select: all;
      user-select: all;
      font-variant-numeric: tabular-nums;
    }

    /* Mobile & Small Viewport Responsiveness */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 12px !important;
      }
      .main-card {
        width: 100% !important;
        border-radius: 14px !important;
      }
      .section-pad {
        padding-left: 22px !important;
        padding-right: 22px !important;
      }
      .header-pad {
        padding-top: 28px !important;
        padding-left: 22px !important;
        padding-right: 22px !important;
      }
      .hero-title {
        font-size: 22px !important;
        line-height: 30px !important;
      }
      .otp-container {
        padding: 18px 10px !important;
      }
      .otp-digit {
        height: 48px !important;
        font-size: 22px !important;
        border-radius: 8px !important;
      }
      .otp-spacer {
        width: 6px !important;
      }
      .cta-table {
        width: 100% !important;
      }
      .copy-btn {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        padding: 15px 20px !important;
        text-align: center !important;
      }
    }

    /* Extra Small Screens (320px - 375px) */
    @media only screen and (max-width: 380px) {
      .section-pad {
        padding-left: 16px !important;
        padding-right: 16px !important;
      }
      .otp-container {
        padding: 14px 8px !important;
      }
      .otp-digit {
        height: 42px !important;
        font-size: 19px !important;
      }
      .otp-spacer {
        width: 4px !important;
      }
    }
  </style>
</head>

<body style="margin:0; padding:0; background-color:#f5f5f5; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing:antialiased;">

  <!-- Hidden Inbox Preheader Text -->
  <div style="display:none; font-size:1px; line-height:1px; max-height:0px; max-width:0px; opacity:0; overflow:hidden; mso-hide:all;">
    Your Locked In Circle verification code is ${otp}. Valid for 10 minutes. &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <!-- Outer Email Wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f5; width:100%;">
    <tr>
      <td align="center" class="email-wrapper" style="padding:40px 12px;">

        <!-- Main Card Container -->
        <table role="presentation" class="main-card" width="560" cellpadding="0" cellspacing="0" border="0" style="width:560px; max-width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden;">

          <!-- Top Precision Accent Bar -->
          <tr>
            <td style="height:6px; line-height:6px; font-size:0; background-color:#0a0a0a;">&nbsp;</td>
          </tr>

          <!-- Brand Emblem & Wordmark Header -->
          <tr>
            <td align="center" class="header-pad" style="padding:36px 40px 0 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
                <tr>
                  <td align="center" style="padding-bottom:14px;">
                    <!-- Pure CSS/HTML Geometric "Locked In Circle" Emblem (#0a0a0a) -->
                  
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
                    <p style="margin:0; font-size:22px; font-weight:900; color:#0a0a0a; letter-spacing:-0.3px; line-height:26px;">
                      Locked In Circle
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Subtle Hairline Divider -->
          <tr>
            <td class="section-pad" style="padding:26px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #e8e8e8; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Primary Greeting & Copy -->
          <tr>
            <td class="section-pad" style="padding:30px 40px 0 40px; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
              <h1 class="hero-title" style="margin:0; font-size:25px; font-weight:700; color:#050315; letter-spacing:-0.4px; line-height:33px;">
                Verify your email address
              </h1>
              <p style="margin:14px 0 0 0; font-size:15px; color:#737373; line-height:24px;">
                Hi <strong style="font-weight:600; color:#0a0a0a;">${userName}</strong>,
              </p>
              <p style="margin:10px 0 0 0; font-size:15px; color:#737373; line-height:24px;">
                Welcome to <strong style="font-weight:600; color:#0a0a0a;">Locked In Circle</strong>. Use the verification code below to complete your account setup. This code is valid for <strong style="font-weight:600; color:#0a0a0a;">10 minutes</strong>.
              </p>
            </td>
          </tr>

          <!-- Precision 6-Digit OTP Display Container -->
          <tr>
            <td align="center" class="section-pad" style="padding:30px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;">
                <tr>
                  <td align="center" class="otp-container" style="background-color:#f5f5f5; border:1px dashed #d4d4d4; border-radius:14px; padding:24px 20px;">
                    
          

                    <!-- 6 Individual Digit Tiles -->
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="width:100%; max-width:420px; table-layout:fixed;">
                      <tr>
                        <td align="center" valign="middle" class="otp-digit" style="height:58px; background-color:#ffffff; border:1px solid #e5e5e5; border-radius:10px; font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size:26px; font-weight:700; color:#0a0a0a; text-align:center; vertical-align:middle;">${digits[0]}</td>
                        <td class="otp-spacer" style="width:8px; font-size:0; line-height:0;">&nbsp;</td>
                        <td align="center" valign="middle" class="otp-digit" style="height:58px; background-color:#ffffff; border:1px solid #e5e5e5; border-radius:10px; font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size:26px; font-weight:700; color:#0a0a0a; text-align:center; vertical-align:middle;">${digits[1]}</td>
                        <td class="otp-spacer" style="width:8px; font-size:0; line-height:0;">&nbsp;</td>
                        <td align="center" valign="middle" class="otp-digit" style="height:58px; background-color:#ffffff; border:1px solid #e5e5e5; border-radius:10px; font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size:26px; font-weight:700; color:#0a0a0a; text-align:center; vertical-align:middle;">${digits[2]}</td>
                        <td class="otp-spacer" style="width:8px; font-size:0; line-height:0;">&nbsp;</td>
                        <td align="center" valign="middle" class="otp-digit" style="height:58px; background-color:#ffffff; border:1px solid #e5e5e5; border-radius:10px; font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size:26px; font-weight:700; color:#0a0a0a; text-align:center; vertical-align:middle;">${digits[3]}</td>
                        <td class="otp-spacer" style="width:8px; font-size:0; line-height:0;">&nbsp;</td>
                        <td align="center" valign="middle" class="otp-digit" style="height:58px; background-color:#ffffff; border:1px solid #e5e5e5; border-radius:10px; font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size:26px; font-weight:700; color:#0a0a0a; text-align:center; vertical-align:middle;">${digits[4]}</td>
                        <td class="otp-spacer" style="width:8px; font-size:0; line-height:0;">&nbsp;</td>
                        <td align="center" valign="middle" class="otp-digit" style="height:58px; background-color:#ffffff; border:1px solid #e5e5e5; border-radius:10px; font-family:'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace; font-size:26px; font-weight:700; color:#0a0a0a; text-align:center; vertical-align:middle;">${digits[5]}</td>
                      </tr>
                    </table>

                    <!-- Plain-Text Copyable Code Fallback & Expiration -->
                    <p style="margin:14px 0 0 0; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif; font-size:12px; color:#737373; text-align:center; line-height:18px;">
                     Code expires in 10 minutes
                    </p>

                  </td>
                </tr>
              </table>
            </td>
          </tr>

        

          <!-- Security Advisory Callout -->
          <tr>
            <td class="section-pad" style="padding:28px 40px 0 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#f5f5f5; border-left:3px solid #0a0a0a; border-radius:0 10px 10px 0; padding:14px 18px; font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
                    <p style="margin:0; font-size:13px; color:#737373; line-height:20px;">
                      <strong style="font-weight:600; color:#0a0a0a;">Security tip:</strong> Locked In Circle will never ask for this code via phone, WhatsApp, or social media. If you didn't request this code, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td class="section-pad" style="padding:36px 40px 32px 40px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #e8e8e8; font-size:0; line-height:0; padding-top:24px;">&nbsp;</td>
                </tr>
                <tr>
                  <td align="center" style="font-family:'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;">
                    <p style="margin:0; font-size:13px; font-weight:600; color:#0a0a0a;">
                      Locked In Circle
                    </p>
                    <p style="margin:14px 0 0 0; font-size:11px; color:#c4c4c4; line-height:18px;">
                      You received this email because an account was created with this address.<br/>
                      &copy; 2026 Locked In Circle. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- /Main Card Container -->
        </table>
        <!-- /Main Elevated Card Container -->

      </td>
    </tr>
  </table>

</body>
</html>`;
};

export default otpEMailtemplate;