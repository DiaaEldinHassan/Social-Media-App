import type { JwtPayload } from "jsonwebtoken";
import type { Role } from "../enums";

export interface ITokenPayload extends JwtPayload {
    role: Role;
    userId: string;
    confirmed: boolean;
}
