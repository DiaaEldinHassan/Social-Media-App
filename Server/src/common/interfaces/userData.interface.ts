import { Provider, Role } from "../enums";

export interface userData {
  username: string;
  email: string;
  phone?: string[];
  password: string;
  bio?: string;
  profilePicture: string;
  provider: Provider.GOOGLE | Provider.LOCAL;
  role: Role.ADMIN | Role.MODERATOR | Role.SUPER_ADMIN | Role.USER;
}

export interface userDataToken {
  token: string;
}