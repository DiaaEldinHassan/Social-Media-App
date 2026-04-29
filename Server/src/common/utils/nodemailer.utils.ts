import nodemailer from "nodemailer";
import { env } from "../../config/env.config";
import { buildOtpEmailTemplate } from "../templates/otp.template";
import { BadRequestError } from "./error.utils";

export async function sendOTP(email: string, otp: string): Promise<void> {
  const user = env.NODEMAILER_EMAIL?.trim();
  const pass = env.NODEMAILER_PASSWORD?.trim()?.replace(/\s+/g, "");
  if (!user || !pass) {
    throw new BadRequestError(
      "Missing NODEMAILER_EMAIL or NODEMAILER_PASSWORD",
    );
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const { subject, text, html } = buildOtpEmailTemplate(otp);
  await transporter.sendMail({
    from: user,
    to: email,
    subject,
    text,
    html,
  });
}
