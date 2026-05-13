import { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLList } from "graphql";
import { UserType } from "../../users/gql/user.types.gql";

export const ReactionType = new GraphQLObjectType({
  name: "Reaction",
  fields: {
    userId: { type: GraphQLID },
    type: { type: GraphQLInt },
  },
});

export const ReactionSummaryType = new GraphQLObjectType({
  name: "ReactionSummary",
  fields: {
    type: { type: GraphQLInt },
    count: { type: GraphQLInt },
  },
});

export const PostType = new GraphQLObjectType({
  name: "Post",
  fields: {
    _id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    createdBy: { type: UserType },
    reactions: { type: new GraphQLList(ReactionType) },
    reactionSummary: { type: new GraphQLList(ReactionSummaryType) },
    commentsCount: { type: GraphQLInt },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
