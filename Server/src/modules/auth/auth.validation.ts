import { z } from "zod";
import { Role, Provider } from "../../common";

export const registerSchema = z.object({
  body: z.object({
    username: z.string().min(3, "Name must be at least 3 characters long"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    role: z
      .enum([Role.USER, Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR])
      .default(Role.USER),
    phone: z
      .array(z.string().min(10, "Phone number must be at least 10 digits long"))
      .optional(),
    bio: z.string().optional(),
    profilePicture: z.string().optional(),
    provider: z.enum([Provider.GOOGLE, Provider.LOCAL]).default(Provider.LOCAL),
  })
});


export const loginSchema = z.object({
  body: z.union([
    z.object({
      email: z.string().email("Invalid email address"),
      password: z.string().min(6, "Password must be at least 6 characters long"),
    }),
    z.object({
      token: z.string().min(1, "Token is required"),
    }),
  ])
});

export const forgetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().length(6, "OTP must be 6 digits"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  })
});

export const updatePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters long"),
  })
});