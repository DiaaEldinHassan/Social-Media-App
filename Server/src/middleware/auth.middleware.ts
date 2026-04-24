import type { NextFunction, Request, Response, RequestHandler } from "express";
import { Role, verifyToken } from "../common";
import { redisService } from "../common/services/redis.service";

export const authMiddleware =
  (
    aud: Role[] = [Role.USER, Role.ADMIN, Role.SUPER_ADMIN, Role.MODERATOR],
  ): RequestHandler =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({ message: "Unauthorized: No authorization header provided" });
        return;
      }

      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        res.status(401).json({ message: "Unauthorized: Format is 'Bearer <token>'" });
        return;
      }

      const token = parts[1];
      if (!token) {
        res.status(401).json({ message: "Unauthorized: Token missing" });
        return;
      }

      let decodedToken;
      try {
        decodedToken = verifyToken(token);
      } catch (err) {
        console.error(`[AUTH] Token verification failed for: "${token}"`);
        console.error(`[AUTH] Error:`, err);
        throw err;
      }

      if (aud.length > 0 && !aud.includes(decodedToken.role)) {
        res
          .status(403)
          .json({ message: "Forbidden: Insufficient permissions" });
        return;
      }

      const isRevoked = await redisService.isTokenRevoked(token);
      if (isRevoked) {
        res
          .status(401)
          .json({ message: "Unauthorized: Token has been revoked" });
        return;
      }

      if (decodedToken.confirmed !== true) {
        console.log("Please Confirm Your Email");
      }
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      next(error);
    }
  };
