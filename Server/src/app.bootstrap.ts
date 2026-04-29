import { dbConnection, redisConnection } from "./DB";
import express from "express";
import type { Express } from "express";
import type { Server } from "node:http";
import cors from "cors";
import { rateLimit, type RateLimitRequestHandler } from "express-rate-limit";
import helmet from "helmet";
import { globalErrorHandler } from "./middleware";
import { env } from "./config/env.config";
import {
  auth,
  users,
  posts,
  comments,
  reactions,
  stories,
  feed,
} from "./modules/";

export async function bootstrap(): Promise<{ app: Express; server: Server }> {
  // DB Connection
  await dbConnection();
  await redisConnection();
  // Express Application
  const app: Express = express();
  app.set("trust proxy", 1);
  // File Parser
  app.use(express.json());
  // CORS
  const allowedOrigins = [env.ORIGIN].filter(Boolean);
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS origin denied: ${origin}`));
        }
      },
      credentials: true,
    }),
  );
  // URL-encoded Parser
  app.use(express.urlencoded({ extended: true }));
  const globalRateLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: "Too many requests, please try again shortly.",
  });
  const authRateLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 30,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    ipv6Subnet: 56,
    message: "Too many authentication attempts, please try again in 15 minutes.",
  });
  // Helmet
  app.use(helmet());
  // Rate Limiter
  app.use(globalRateLimiter);
  // Routing
  app.use("/auth", authRateLimiter, auth);
  app.use("/users", users);
  app.use("/posts", posts);
  app.use("/comments", comments);
  app.use("/reactions", reactions);
  app.use("/stories", stories);
  app.use("/feed", feed);
  app.get("/ready", (_req, res) =>
    res.status(200).json({ ok: true, dependencies: { db: "up", redis: "up" } }),
  );
  // Middlewares
  app.use(globalErrorHandler);
  // Server Listener
  const server = app.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT} 🚀🚀`);
  });
  return { app, server };
}
