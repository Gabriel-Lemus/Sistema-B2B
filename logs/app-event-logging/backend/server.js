const { MongoClient } = require('mongodb');
const { ApolloServer, gql } = require('apollo-server');
const GraphQLJSON = require('graphql-type-json')
const { GraphQLDateTime } = require('graphql-iso-date')

const Todo = require('./Todo')
const TodoCreateEvent = require('./TodoCreateEvent')
const TodoUpdateEvent = require('./TodoUpdateEvent')
const TodoDeleteEvent = require('./TodoDeleteEvent')
const EventProcessor = require('./Event/EventProcessor')

const typeDefs = gql`
  scalar JSON

  scalar DateTime

  type Query {
    todos: [Todo!]!
    events: [Event!]!
  }

  type Todo {
    _id: ID!
    description: String
    isDone: Boolean
  }

  type Event {
    _id: ID!
    timestamp: DateTime!
    userId: Int!
    username: String!
    action: String!
    entityId: String!
    deltas: [JSON!]!
  }

  type Mutation {
    createTodo: Todo!
    updateTodo(input: UpdateTodoInput!): Todo!
    deleteTodo(input: DeleteTodoInput!): Todo!
  }

  input UpdateTodoInput {
    _id: ID!
    description: String
    isDone: Boolean
  }

  input DeleteTodoInput {
    _id: ID!
  }
`;

const resolvers = {
  JSON: GraphQLJSON,
  DateTime: GraphQLDateTime,
  Query: {
    todos: (parent, args, context, info) => {
      const { db } = context
      
      return db.collection('todos').find().toArray()
    },
    events: (parent, args, context, info) => {
      const { db } = context
      
      return db.collection('events')
        .find()
        .sort({ timestamp: -1 })
        .toArray()
    },
  },
  Mutation: {
    createTodo: async (parent, args, context, info) => {
      const { db, mongoClient, username, userId } = context

      let createdTodo

      // const session = mongoClient.startSession()

      // await session.withTransaction(async () => {
        const todo = await Todo.init({ 
          data: { description: '', isDone: false }, 
          db,
        })

        const creationEvent = new TodoCreateEvent({ username, userId }, todo)

        const eventProc = new EventProcessor()

        createdTodo = await eventProc.process({
          event: creationEvent,
          db,
          session: null,
        })
      // })
      
      return createdTodo
    },
    updateTodo: async (parent, args, context, info) => {
      const { input: { _id, description, isDone } } = args
      const { db, mongoClient, username, userId } = context

      let updatedTodo

      // const session = mongoClient.startSession()

      // await session.withTransaction(async () => {
        const todo = await Todo.init({
          data: { _id, description, isDone },
          db,
        })

        const revisionEvent = new TodoUpdateEvent({ username, userId }, todo)

        const eventProc = new EventProcessor()

        updatedTodo = await eventProc.process({
          event: revisionEvent,
          db,
          session: null,
        })
      // })

      return updatedTodo
    },
    deleteTodo: async (parent, { input: { _id } }, context, info) => {
      const { db, mongoClient, username, userId } = context

      let deletedTodo

      // const session = mongoClient.startSession()

      // await session.withTransaction(async () => {
        const todo = await Todo.init({ data: { _id }, db })

        const deletionEvent = new TodoDeleteEvent({ username, userId }, todo)

        const eventProc = new EventProcessor()

        deletedTodo = await eventProc.process({
          event: deletionEvent,
          db,
          session: null,
        })
      // })
      
      return deletedTodo
    },
  }
};

MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client) => {
  if (err) throw err

  console.log(`Connected to MongoDB cluster`)

  const server = new ApolloServer({ 
    typeDefs, 
    resolvers,
    context: ({ req }) => {
      const { username, userId } = JSON.parse(req.headers.user_info)
      
      return {
        mongoClient: client,
        db: client.db('todos_app'),
        username, 
        userId,
      }
    },
  });

  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });
})
