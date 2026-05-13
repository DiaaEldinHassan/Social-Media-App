import { GraphQLID, GraphQLString, GraphQLInt, GraphQLNonNull, GraphQLUnionType } from "graphql";
import { reactionsService } from "../reactions.service";
import { PostType } from "../../posts/gql/posts.types.gql";
import { CommentType } from "../../comments/gql/comments.types.gql";
import { ResponseMessageType } from "../../graphql/common.types.gql";

const ReactionTargetType = new GraphQLUnionType({
  name: "ReactionTarget",
  types: [PostType, CommentType],
  resolveType(value) {
    if (value.title) {
      return "Post";
    }
    return "Comment";
  },
});

export class ReactionGQLSchema {
  constructor() {}

  registerQuery() {
    return {};
  }

  registerMutation() {
    return {
      addReaction: {
        type: ReactionTargetType,
        args: {
          targetType: { type: new GraphQLNonNull(GraphQLString) }, // "post" or "comment"
          targetId: { type: new GraphQLNonNull(GraphQLID) },
          type: { type: new GraphQLNonNull(GraphQLInt) },
        },
        resolve: async (_parent: any, args: any, context: any) => {
          const userId = context.user.userId;
          return await reactionsService.upsertReaction({ ...args, userId });
        },
      },
      removeReaction: {
        type: ResponseMessageType,
        args: {
          targetType: { type: new GraphQLNonNull(GraphQLString) },
          targetId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_parent: any, { targetType, targetId }: any, context: any) => {
          const userId = context.user.userId;
          return await reactionsService.removeReaction(userId, targetType, targetId);
        },
      },
    };
  }
}
