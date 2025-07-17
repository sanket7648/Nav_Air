import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, username, verificationToken) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
  const otpUrl = `${process.env.FRONTEND_URL}/otp-verify`;

  // Aviation proverbs
  const proverbs = [
    'The engine is the heart of an airplane, but the pilot is its soul.',
    'A mile of highway will take you a mile. A mile of runway will take you anywhere.',
    'To most people, the sky is the limit. To those who love aviation, the sky is home.',
  ];

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to NavAir! Verify Your Email Address',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fbff; border-radius: 12px; box-shadow: 0 2px 8px #e3eaf1; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #007bff 0%, #00c6ff 100%); padding: 32px 0 16px 0; text-align: center;">
          <!-- NavAir SVG Icon -->
          <span style="display: inline-block; vertical-align: middle; margin-bottom: 8px;">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="28" fill="#fff"/>
              <path d="M28 12L32 28H44L34 34L38 48L28 39L18 48L22 34L12 28H24L28 12Z" fill="#007bff"/>
            </svg>
          </span>
          <h1 style="color: #fff; font-size: 2.2rem; margin: 0; letter-spacing: 2px; font-weight: 700;">NavAir</h1>
          <p style="color: #e3f2fd; font-size: 1.1rem; margin: 8px 0 0 0;">Welcome to our platform, <b>${username}</b>!</p>
        </div>
        <div style="padding: 32px 24px 24px 24px; background: #fff;">
          <p style="font-size: 1.1rem; color: #333; margin-bottom: 24px;">Thank you for joining NavAir. To complete your registration, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${verificationUrl}" 
               style="background: linear-gradient(90deg, #007bff 0%, #00c6ff 100%); color: #fff; padding: 14px 36px; text-decoration: none; border-radius: 6px; font-size: 1.1rem; font-weight: 600; box-shadow: 0 2px 8px #e3eaf1; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 0.98rem; margin-bottom: 16px;">Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #007bff; font-size: 0.98rem; margin-bottom: 24px;">${verificationUrl}</p>
          <hr style="margin: 32px 0 24px 0; border: none; border-top: 1px solid #e3eaf1;">
          <div style="background: #f1f8fe; border-radius: 8px; padding: 18px 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <!-- Airplane SVG Icon -->
              <span style="display: inline-block;">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 14L26 4L18 24L13 15L2 14Z" fill="#00c6ff"/>
                  <circle cx="13" cy="15" r="2" fill="#007bff"/>
                </svg>
              </span>
              <div style="flex: 1;">
                <p style="margin: 0; color: #007bff; font-weight: 600; font-size: 1.05rem;">Aviation Proverbs</p>
                <ul style="margin: 8px 0 0 18px; padding: 0; color: #333; font-size: 0.98rem;">
                  <li>${proverbs[0]}</li>
                  <li>${proverbs[1]}</li>
                  <li>${proverbs[2]}</li>
                </ul>
              </div>
            </div>
          </div>
          <p style="color: #333; font-size: 1rem; margin-bottom: 18px;">Alternatively, you can verify your account using the OTP sent to your email.</p>
          <div style="text-align: center; margin: 16px 0;">
            <a href="${otpUrl}" style="color: #007bff; text-decoration: underline; font-weight: bold; font-size: 1.05rem;">Enter OTP here</a>
          </div>
          <p style="color: #888; font-size: 0.95rem;">This link and OTP will expire in 10 minutes for security reasons.</p>
          <p style="color: #888; font-size: 0.95rem;">If you didn't create an account, please ignore this email.</p>
        </div>
        <div style="background: #e3f2fd; padding: 16px 0; text-align: center;">
          <p style="color: #789; font-size: 0.92rem; margin: 0;">This is an automated email, please do not reply.<br/>© ${new Date().getFullYear()} NavAir</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
};

// Verify transporter
export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log('Email transporter is ready');
    return true;
  } catch (error) {
    console.error('Email transporter verification failed:', error);
    return false;
  }
};

// Send OTP email
export const sendOtpEmail = async (email, username, otp) => {
  // Aviation proverbs
  const proverbs = [
    'The engine is the heart of an airplane, but the pilot is its soul.',
    'A mile of highway will take you a mile. A mile of runway will take you anywhere.',
    'To most people, the sky is the limit. To those who love aviation, the sky is home.',
  ];

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your NavAir OTP Code for Verification',
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f7fbff; border-radius: 12px; box-shadow: 0 2px 8px #e3eaf1; overflow: hidden;">
        <div style="background: linear-gradient(90deg, #007bff 0%, #00c6ff 100%); padding: 32px 0 16px 0; text-align: center;">
          <!-- NavAir SVG Icon -->
          <span style="display: inline-block; vertical-align: middle; margin-bottom: 8px;">
            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="28" cy="28" r="28" fill="#fff"/>
              <path d="M28 12L32 28H44L34 34L38 48L28 39L18 48L22 34L12 28H24L28 12Z" fill="#007bff"/>
            </svg>
          </span>
          <h1 style="color: #fff; font-size: 2.2rem; margin: 0; letter-spacing: 2px; font-weight: 700;">NavAir</h1>
          <p style="color: #e3f2fd; font-size: 1.1rem; margin: 8px 0 0 0;">Welcome to our platform, <b>${username}</b>!</p>
        </div>
        <div style="padding: 32px 24px 24px 24px; background: #fff;">
          <p style="font-size: 1.1rem; color: #333; margin-bottom: 24px;">Your One-Time Password (OTP) for email verification is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 2.2rem; letter-spacing: 8px; color: #007bff; font-weight: bold; background: #e3f2fd; padding: 12px 32px; border-radius: 8px; display: inline-block;">${otp}</span>
          </div>
          <p style="color: #888; font-size: 1rem; margin-bottom: 24px;">This OTP will expire in 10 minutes.</p>
          <hr style="margin: 32px 0 24px 0; border: none; border-top: 1px solid #e3eaf1;">
          <div style="background: #f1f8fe; border-radius: 8px; padding: 18px 16px; margin-bottom: 24px;">
            <div style="display: flex; align-items: flex-start; gap: 12px;">
              <!-- Airplane SVG Icon -->
              <span style="display: inline-block;">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 14L26 4L18 24L13 15L2 14Z" fill="#00c6ff"/>
                  <circle cx="13" cy="15" r="2" fill="#007bff"/>
                </svg>
              </span>
              <div style="flex: 1;">
                <p style="margin: 0; color: #007bff; font-weight: 600; font-size: 1.05rem;">Aviation Proverbs</p>
                <ul style="margin: 8px 0 0 18px; padding: 0; color: #333; font-size: 0.98rem;">
                  <li>${proverbs[0]}</li>
                  <li>${proverbs[1]}</li>
                  <li>${proverbs[2]}</li>
                </ul>
              </div>
            </div>
          </div>
          <p style="color: #888; font-size: 0.95rem;">If you didn't request this, please ignore this email.</p>
        </div>
        <div style="background: #e3f2fd; padding: 16px 0; text-align: center;">
          <p style="color: #789; font-size: 0.92rem; margin: 0;">This is an automated email, please do not reply.<br/>© ${new Date().getFullYear()} NavAir</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
}; 

async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

async function sendResetPasswordEmail(email, token) {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;
  const subject = 'Password Reset Request';
  const text = `You requested a password reset. Click the link below to reset your password.\n\n${resetLink}\n\nIf you did not request this, please ignore this email.`;
  // Use your existing email sending logic
  await sendEmail(email, subject, text);
}

export { sendResetPasswordEmail }; 