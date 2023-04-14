const { ApolloServer } = require("apollo-server");
const mongoose = require("mongoose");
const { readFileSync } = require("fs");

mongoose.set("strictQuery", true);

const resolvers = require("./graphql/resolvers");

const MONGODB =
  "mongodb+srv://authex:adi@cluster0.wmycpjd.mongodb.net/authdb?retryWrites=true&w=majority";

const typeDefs = readFileSync("./graphql/schema.graphql", "utf8");

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

mongoose
  .connect(MONGODB, { useNewUrlParser: true })
  .then(() => {
    console.log("MongoDB Connected");
    return server.listen({ port: 5000 });
  })
  .then((res) => {
    console.log(`Server running at ${res.url}`);
  });
