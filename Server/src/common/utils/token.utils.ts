import jwt from "jsonwebtoken";
import { env } from "../../config/env.config";
import type { ITokenPayload } from "../interfaces";

export const generateToken = (payload: any) => {
    try {
        const accessToken= jwt.sign(payload, env.JWT_SECRET as string, {expiresIn: "1h"});
        const refreshToken= jwt.sign(payload, env.JWT_SECRET as string, {expiresIn: "7d"});
        return {accessToken, refreshToken};
    } catch (error) {
        throw error;
    }
}

export const verifyToken = (token: string): ITokenPayload => {
    try {
        const decodedToken = jwt.verify(token, env.JWT_SECRET as string) as ITokenPayload;
        return decodedToken;
    } catch (error) {
        throw error;
    }
}