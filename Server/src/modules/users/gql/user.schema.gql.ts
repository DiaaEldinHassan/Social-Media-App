import { GraphQLID, GraphQLString} from "graphql";
import { UserType } from "./user.types.gql";
import { usersService } from "../users.service";
import { ResponseMessageType } from "../../graphql/common.types.gql";

export class UserGQLSchema {
  constructor() {}

  registerQuery() {
    return {
      me: {
        type: UserType,
        description: "Get current user profile",
        resolve: async (_parent: any, _args: any, context: any) => {
          const userId = context.user.userId;
          return await usersService.getUserData(userId);
        },
      },
      userById: {
        type: UserType,
        description: "Get public user data by ID",
        args: {
          userId: { type: GraphQLID },
        },
        resolve: async (_parent: any, { userId }: any) => {
          return await usersService.getPublicUserData(userId);
        },
      },
    };
  }

  registerMutation() {
    return {
      updateMe: {
        type: UserType,
        description: "Update current user profile",
        args: {
          username: { type: GraphQLString },
          bio: { type: GraphQLString },
        },
        resolve: async (_parent: any, args: any, context: any) => {
          const userId = context.user.userId;
          return await usersService.updateUserData(userId, args);
        },
      },
      deleteMe: {
        type: ResponseMessageType,
        description: "Soft delete current user account",
        resolve: async (_parent: any, _args: any, context: any) => {
          const userId = context.user.userId;
          return await usersService.deleteMyAccount(userId);
        },
      },
      restoreMe: {
        type: UserType,
        description: "Restore current user account",
        resolve: async (_parent: any, _args: any, context: any) => {
          const userId = context.user.userId;
          return await usersService.restoreMyAccount(userId);
        },
      },
    };
  }
}