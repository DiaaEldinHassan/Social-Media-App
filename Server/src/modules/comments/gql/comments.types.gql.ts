import { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLList, GraphQLInt } from "graphql";
import { UserType } from "../../users/gql/user.types.gql";
import { ReactionType, ReactionSummaryType } from "../../posts/gql/posts.types.gql";

export const CommentType: GraphQLObjectType = new GraphQLObjectType({
  name: "Comment",
  fields: () => ({
    _id: { type: GraphQLID },
    content: { type: GraphQLString },
    postId: { type: GraphQLID },
    createdBy: { type: UserType },
    parentCommentId: { type: GraphQLID },
    rootCommentId: { type: GraphQLID },
    reactions: { type: new GraphQLList(ReactionType) },
    reactionSummary: { type: new GraphQLList(ReactionSummaryType) },
    repliesCount: { type: GraphQLInt },
    replies: { type: new GraphQLList(CommentType) },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  }),
});
