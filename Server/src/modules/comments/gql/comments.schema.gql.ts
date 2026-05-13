import { GraphQLID, GraphQLString, GraphQLNonNull } from "graphql";
import { CommentType } from "./comments.types.gql";
import { commentsService } from "../comments.service";
import { ResponseMessageType } from "../../graphql/common.types.gql";

export class CommentGQLSchema {
  constructor() {}

  registerQuery() {
    return {
      commentById: {
        type: CommentType,
        args: {
          commentId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_parent: any, { commentId }: any) => {
          return await commentsService.getCommentById(commentId);
        },
      },
    };
  }

  registerMutation() {
    return {
      createComment: {
        type: CommentType,
        args: {
          postId: { type: new GraphQLNonNull(GraphQLID) },
          content: { type: new GraphQLNonNull(GraphQLString) },
          parentCommentId: { type: GraphQLID },
        },
        resolve: async (_parent: any, args: any, context: any) => {
          const userId = context.user.userId;
          return await commentsService.createComment({ ...args, userId });
        },
      },
      updateComment: {
        type: CommentType,
        args: {
          commentId: { type: new GraphQLNonNull(GraphQLID) },
          content: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (_parent: any, { commentId, content }: any, context: any) => {
          const userId = context.user.userId;
          return await commentsService.updateComment(commentId, userId, content);
        },
      },
      deleteComment: {
        type: ResponseMessageType,
        args: {
          commentId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_parent: any, { commentId }: any, context: any) => {
          const userId = context.user.userId;
          return await commentsService.deleteComment(commentId, userId);
        },
      },
    };
  }
}
