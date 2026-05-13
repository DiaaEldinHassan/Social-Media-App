import { GraphQLList, GraphQLInt } from "graphql";
import { PostType } from "../../posts/gql/posts.types.gql";
import { feedService } from "../feed.service";

export class FeedGQLSchema {
  constructor() {}

  registerQuery() {
    return {
      getFeed: {
        type: new GraphQLList(PostType),
        args: {
          page: { type: GraphQLInt },
          limit: { type: GraphQLInt },
        },
        resolve: async (_parent: any, { page, limit }: any) => {
          return await feedService.getFeed(page, limit);
        },
      },
    };
  }

  registerMutation() {
    return {};
  }
}
