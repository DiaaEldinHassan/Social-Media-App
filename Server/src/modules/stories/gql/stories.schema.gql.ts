import { GraphQLID, GraphQLList, GraphQLString, GraphQLNonNull } from "graphql";
import { StoryType } from "./stories.types.gql";
import { storiesService } from "../stories.service";
import { ResponseMessageType } from "../../graphql/common.types.gql";

export class StoryGQLSchema {
  constructor() {}

  registerQuery() {
    return {
      listActiveStories: {
        type: new GraphQLList(StoryType),
        resolve: async () => {
          return await storiesService.listActiveStories();
        },
      },
    };
  }

  registerMutation() {
    return {
      createStory: {
        type: StoryType,
        args: {
          content: { type: GraphQLString },
          mediaUrl: { type: GraphQLString },
        },
        resolve: async (_parent: any, args: any, context: any) => {
          const userId = context.user.userId;
          return await storiesService.createStory(userId, args);
        },
      },
      deleteStory: {
        type: ResponseMessageType,
        args: {
          storyId: { type: new GraphQLNonNull(GraphQLID) },
        },
        resolve: async (_parent: any, { storyId }: any, context: any) => {
          const userId = context.user.userId;
          return await storiesService.deleteStory(userId, storyId);
        },
      },
    };
  }
}
