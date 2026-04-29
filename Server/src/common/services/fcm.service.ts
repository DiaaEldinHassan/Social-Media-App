import { env } from "../../config/env.config";

type SendPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

class FcmService {
  async sendToToken(token: string, payload: SendPayload): Promise<{ success: boolean; error?: string }> {
    try {
      if (!env.FCM_SERVER_KEY) {
        return { success: false, error: "FCM_SERVER_KEY is not configured" };
      }

      const response = await fetch("https://fcm.googleapis.com/fcm/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `key=${env.FCM_SERVER_KEY}`,
        },
        body: JSON.stringify({
          to: token,
          notification: {
            title: payload.title,
            body: payload.body,
          },
          data: payload.data ?? {},
          priority: "high",
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        return { success: false, error: text || `HTTP ${response.status}` };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown FCM error",
      };
    }
  }
}

export const fcmService = new FcmService();
