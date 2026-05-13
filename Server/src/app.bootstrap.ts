import { dbConnection, redisConnection } from "./DB";
import express from "express";
import type { Express } from "express";
import { createServer } from "node:http";
import cors from "cors";
import { rateLimit, type RateLimitRequestHandler } from "express-rate-limit";
import helmet from "helmet";
import { authMiddleware, globalErrorHandler } from "./middleware";
import { env } from "./config/env.config";
import {
  auth,
  users,
  posts,
  comments,
  reactions,
  stories,
  feed,
  schema,
  chatHandler,
  chatRoutes,
} from "./modules/";
import { Server } from "socket.io";
import { createHandler } from "graphql-http/lib/use/express";
import { Role, s3Service, verifyToken } from "./common";
import { UnauthorizedError } from "./common/utils/error.utils";

export async function bootstrap(): Promise<{
  server: ReturnType<typeof createServer>;
}> {
  // DB Connection
  await dbConnection();
  await redisConnection();
  // Express Application
  const app: Express = express();
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });
  // S3 Configuration
  await s3Service.ensureBucketPublicRead();
  app.set("trust proxy", 1);
  // File Parser
  app.use(express.json());
  // Socket.io
  io.on("connection", (socket) => {
    console.log("User Connected Successfully");
    chatHandler(io, socket);
  });
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
    message:
      "Too many authentication attempts, please try again in 15 minutes.",
  });
  // Helmet
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
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
app.use("/messages", chatRoutes);
  app.all(
    "/graphql",
    authMiddleware([Role.ADMIN, Role.MODERATOR, Role.SUPER_ADMIN, Role.USER]),
    createHandler({
      schema,
      context: (req: any) => {
        if (!req.user && req.headers.authorization) {
          try {
            const token = req.headers.authorization.split(" ")[1];
            req.user = verifyToken(token);
          } catch (err) {
            console.error("GraphQL auth error:", err);
            throw new UnauthorizedError();
          }
        }
        return {
          req,
          user: req.user,
        };
      },
    }),
  );
  app.get("/ready", (_req, res) =>
    res.status(200).json({ ok: true, dependencies: { db: "up", redis: "up" } }),
  );
  // Middlewares
  app.use(globalErrorHandler);
  // Server Listener
  server.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT} 🚀🚀`);
  });
  return { server };
}
