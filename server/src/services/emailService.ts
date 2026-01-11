// server/src/services/emailService.ts

import nodemailer from 'nodemailer';

// Create a reusable transporter using the default SMTP transport
export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    // 1. Generate Test Account (Fake Inbox)
    const testAccount = await nodemailer.createTestAccount();

    // 2. Create Transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // 3. Send Mail
    const info = await transporter.sendMail({
      from: '"ResolvAI Support" <support@resolvai.com>',
      to: to,
      subject: subject,
      text: text,
      html: `<b>${text}</b>`, // plain text body
    });

    // 4. LOG THE URL (This is the magic part)
    
    console.log("📧 EMAIL SENT (Simulated)");
    console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
    
    
    return info;
  } catch (error) {
    console.error("Email Error:", error);
  }
};