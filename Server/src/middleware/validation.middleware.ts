import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";

export const validate =
  (schema: ZodType) =>
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      await schema.parseAsync({
        ...req.body,
        file: req.file, 
      });
      
      next();
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error?.errors
          ? error.errors.map((err: any) => err.message).join(", ")
          : error.message,
        statusCode: 400,
      });
    }
  };