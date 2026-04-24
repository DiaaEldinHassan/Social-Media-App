import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { authService } from "../../services/auth.service";

const SocialLogin = ({ onSuccess, onError }) => {
  const handleSuccess = async (credentialResponse) => {
    try {
      const token = credentialResponse?.credential;
      if (!token) {
        throw new Error("Google credential not found");
      }

      const response = await authService.signIn({ token });
      if (response.accessToken && response.refreshToken) {
        localStorage.setItem("accessToken", response.accessToken);
        localStorage.setItem("refreshToken", response.refreshToken);
        console.log("✅ Tokens stored successfully");
        onSuccess?.(response);
      }
    } catch (error) {
      console.error("❌ Sign-in failed:", error);
      onError?.(error);
    }
  };

  const handleError = (error) => {
    console.error("❌ Google login failed:", error);
    onError?.(new Error("Google login failed"));
  };

  return (
    <GoogleLogin
      onSuccess={handleSuccess}
      onError={handleError}
      text="continue_with"
    />
  );
};

export default SocialLogin;
