import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.config";

const googleClient = new OAuth2Client({
  clientId: env.GOOGLE_CLIENT_ID!,
});

export const googleAuth = async (token: string): Promise<any> => {
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: env.GOOGLE_CLIENT_ID!,
    });
    if (!ticket) {
      throw new Error("Google Auth Error");
    }
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error("Google Auth Error");
  }
};
