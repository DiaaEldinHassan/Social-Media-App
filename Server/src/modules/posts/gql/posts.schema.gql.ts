import { GraphQLID, GraphQLList, GraphQLString, GraphQLInt,  GraphQLNonNull } from "graphql";
import { PostType } from "./posts.types.gql";
import { postsService } from "../posts.service";
import { ResponseMessageType } from "../../graphql/common.types.gql";

export class PostGQLSchema {
  constructor() {}

  registerQuery() {
    return {
      listPosts: {
        type: new GraphQLList(PostType),
        args: {
          authorId: { type: GraphQLID },
          page: { type: GraphQLInt },
          limit: { type: GraphQLInt },
        },
        resolve: async (_parent: any, args: any) => {
          return await postsService.listPosts(args);
        },
      },
      postById: {
        type: PostType,
        args: {
          postId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_parent: any, { postId }: any) => {
          return await postsService.getPostById(postId);
        },
      },
    };
  }

  registerMutation() {
    return {
      createPost: {
        type: PostType,
        args: {
          title: { type: new GraphQLNonNull(GraphQLString) },
          content: { type: new GraphQLNonNull(GraphQLString) },
        },
        resolve: async (_parent: any, args: any, context: any) => {
          const userId = context.user.userId;
          return await postsService.createPost({ ...args, userId });
        },
      },
      updatePost: {
        type: PostType,
        args: {
          postId: { type: new GraphQLNonNull(GraphQLID) },
          title: { type: GraphQLString },
          content: { type: GraphQLString },
        },
        resolve: async (_parent: any, { postId, ...data }: any, context: any) => {
          const userId = context.user.userId;
          return await postsService.updatePost(postId, userId, data);
        },
      },
      deletePost: {
        type: ResponseMessageType,
        args: {
          postId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_parent: any, { postId }: any, context: any) => {
          const userId = context.user.userId;
          return await postsService.deletePost(postId, userId);
        },
      },
      restorePost: {
        type: PostType,
        args: {
          postId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_parent: any, { postId }: any, context: any) => {
          const userId = context.req.user.userId;
          return await postsService.restorePost(postId, userId);
        },
      },
    };
  }
}
