import { GraphQLObjectType, GraphQLString } from "graphql";

export const ResponseMessageType = new GraphQLObjectType({
  name: "ResponseMessage",
  fields: {
    message: { type: GraphQLString },
  },
});
