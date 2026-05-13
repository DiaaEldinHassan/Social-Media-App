import { GraphQLID, GraphQLObjectType, GraphQLString, GraphQLBoolean } from "graphql";

export const UserType = new GraphQLObjectType({
  name: "User",
  fields: {
    _id: { type: GraphQLID },
    username: { type: GraphQLString },
    email: { type: GraphQLString },
    bio: { type: GraphQLString },
    profilePicture: { type: GraphQLString },
    role: { type: GraphQLString },
    confirmed: { type: GraphQLBoolean },
    createdAt: { type: GraphQLString },
    updatedAt: { type: GraphQLString },
  },
});