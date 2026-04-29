import { ObjectId } from "mongoose";
import { Provider, Role } from "../enums";

export interface IUser {
  userId: ObjectId;
  username: string;
  email: string;
  phone?: string[];
  password: string;
  bio?: string;
  profilePicture: string;
  provider: Provider.GOOGLE | Provider.LOCAL;
  role: Role.ADMIN | Role.MODERATOR | Role.SUPER_ADMIN | Role.USER;
}

export interface IUserToken {
  token: string;
}