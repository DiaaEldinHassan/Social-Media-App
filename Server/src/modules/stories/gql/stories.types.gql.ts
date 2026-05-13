import { GraphQLID, GraphQLObjectType, GraphQLString } from "graphql";
import { UserType } from "../../users/gql/user.types.gql";

export const StoryType = new GraphQLObjectType({
  name: "Story",
  fields: {
    _id: { type: GraphQLID },
    content: { type: GraphQLString },
    mediaUrl: { type: GraphQLString },
    createdBy: { type: UserType },
    expiresAt: { type: GraphQLString },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});
