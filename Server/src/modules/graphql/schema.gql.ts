import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { UserGQLSchema } from "../users/gql";
import { PostGQLSchema } from "../posts/gql";
import { CommentGQLSchema } from "../comments/gql";
import { ReactionGQLSchema } from "../reactions/gql";
import { StoryGQLSchema } from "../stories/gql";
import { FeedGQLSchema } from "../feed/gql";

const userGql = new UserGQLSchema();
const postGql = new PostGQLSchema();
const commentGql = new CommentGQLSchema();
const reactionGql = new ReactionGQLSchema();
const storyGql = new StoryGQLSchema();
const feedGql = new FeedGQLSchema();

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      ...userGql.registerQuery(),
      ...postGql.registerQuery(),
      ...commentGql.registerQuery(),
      ...reactionGql.registerQuery(),
      ...storyGql.registerQuery(),
      ...feedGql.registerQuery(),
    },
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      ...userGql.registerMutation(),
      ...postGql.registerMutation(),
      ...commentGql.registerMutation(),
      ...reactionGql.registerMutation(),
      ...storyGql.registerMutation(),
      ...feedGql.registerMutation(),
    },
  }),
});