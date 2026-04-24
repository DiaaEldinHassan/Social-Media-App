export const buildOtpEmailTemplate = (otp: string) => {
  const subject = "Verify your email with Social Media App";
  const text = `Your verification code is ${otp}. Enter this code inside the app to complete your sign-up. It expires in 10 minutes.`;
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f3f4f6; padding: 40px 0; color: #111827;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 24px 80px rgba(15, 23, 42, 0.12);">
        <div style="background: linear-gradient(135deg, #5c3ce6 0%, #3b82f6 100%); padding: 32px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: -0.02em;">Social Media App</h1>
          <p style="margin: 10px auto 0; max-width: 520px; font-size: 16px; opacity: 0.92;">Your secure verification code is waiting below. Use it to finish signing in.</p>
        </div>

        <div style="padding: 32px 32px 24px;">
          <p style="margin: 0 0 16px; font-size: 16px; color: #374151;">Hello,</p>
          <p style="margin: 0 0 28px; font-size: 15px; color: #4b5563; line-height: 1.75;">Use the code below to verify your email address and complete the authentication process.</p>

          <div style="margin: 0 auto 28px; display: inline-flex; padding: 24px 36px; border-radius: 18px; background: #eef2ff; color: #3730a3; font-size: 30px; font-weight: 700; letter-spacing: 0.2em; box-shadow: inset 0 0 0 1px rgba(59, 130, 246, 0.15);">${otp}</div>

          <div style="padding: 20px; border-radius: 16px; background: #f8fafc; border: 1px solid #e5e7eb;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #6b7280;">Need help?</p>
            <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.7;">If you didn't request this code, you can ignore this message. The code will expire in 10 minutes for your security.</p>
          </div>
        </div>

        <div style="background: #f9fafb; padding: 20px 32px 28px; font-size: 13px; color: #6b7280; text-align: center;">
          <p style="margin: 0;">Social Media App • Secure sign-in email</p>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
};
