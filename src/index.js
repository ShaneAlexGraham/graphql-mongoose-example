// Require the framework and instantiate it
const { ApolloServer, gql } = require('apollo-server-fastify');
const fastify = require('fastify')({ logger: true });
const { isConnected } = require('./db');
const { buildSchemaFromModels } = require('graphql-mongoose-schemabuilder');
const { models } = require('./models');


// Declare a route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// Run the server!
const start = async () => {
  try {
    // create graphql server
    const gqlServer = new ApolloServer({
      schema: buildSchemaFromModels(models)
    });

    await isConnected;
    await fastify.register(gqlServer.createHandler()).listen(process.env.PORT || 3000, '0.0.0.0');
    fastify.log.info(`server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

module.exports = start;
