const { composeWithMongoose } = require('graphql-compose-mongoose/node8');
const { schemaComposer } = require('graphql-compose');
const { models } = require('../models');
const resolvers = {
  query: {
    ById: "findById",
    ByIds: "findByIds",
    One: "findOne",
    Many: "findMany",
    Count: "count",
    Connection: "connection",
    Pagination: "pagination",
  },
  mutation: {
    CreateOne: "createOne",
    CreateMany: "createMany",
    UpdateById: "updateById",
    UpdateOne: "updateOne",
    UpdateMany: "updateMany",
    RemoveById: "removeById",
    RemoveOne: "removeOne",
    RemoveMany: "removeMany",
  }
}

// CONVERT MONGOOSE MODEL TO GraphQL PIECES
const customizationOptions = {}; // left it empty for simplicity, described below
const Fields = {
  TC: {},
  Queries: {},
  Mutations: {}
};

const buildQueries = (name, TC) => {
  let Query = {};
  Object.keys(resolvers.query).forEach((key, i) => {
    Query[`${name}${key}`] = TC.getResolver(Object.values(resolvers.query)[i]);
  });
  return Query;
};

const buildMutations = (name, TC) => {
  let Mutation = {};
  Object.keys(resolvers.mutation).forEach((key, i) => {
    Mutation[`${name}${key}`] = TC.getResolver(Object.values(resolvers.mutation)[i]);
  });
  return Mutation;
};

Object.keys(models).forEach((key, i) => {
  let name = key;
  let model = models[name];
  Fields.TC[name] = composeWithMongoose(model, customizationOptions);
  Fields.Queries = {
    ...Fields.Queries,
    ...buildQueries(name, Fields.TC[name])
  };
  Fields.Mutations = {
    ...Fields.Mutations,
    ...buildMutations(name, Fields.TC[name])
  };
});

schemaComposer.Query.addFields({
  ...Fields.Queries,
});

schemaComposer.Mutations.addFields({
  ...Fields.Mutations
});

Object.keys(models).forEach((key, i) => {
  let name = key;
  let model = models[name];
  Object.keys(model.schema.obj).forEach(key => {
    let value = model.schema.obj[key];
    if(value.ref) {
      let projection = {};
      projection[key] = 1;
      Fields.TC[name].addRelation('collection', {
        resolver: () => Fields.TC[value.ref].getResolver('findById'),
        prepareArgs: {
          _id: source => source[key]
        },
        projection: projection
      }); 
      let prepareArgs = {};
      prepareArgs[key] = source => source._id;
      Fields.TC[value.ref].addRelation('notes', {
        resolver: () => Fields.TC[name].getResolver('findMany'),
        prepareArgs: prepareArgs,
        projection: { _id: 1 }
      });
    }
  });
});

const graphqlSchema = schemaComposer.buildSchema();
module.exports = graphqlSchema;
