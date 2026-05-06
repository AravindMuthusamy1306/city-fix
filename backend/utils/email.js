import nodemailer from 'nodemailer';

let transporter = null;

export const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  return transporter;
};

export const sendVerificationEmail = async (email, token) => {
  const transporter = await getTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: '"CityFix" <noreply@cityfix.com>',
    to: email,
    subject: 'Verify your email address',
    html: `<div>...</div>`, // Your HTML template
  };
  const info = await transporter.sendMail(mailOptions);
  console.log('Verification email sent:', info.messageId);
  if (process.env.NODE_ENV !== 'production') {
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
  }
  return info;
};