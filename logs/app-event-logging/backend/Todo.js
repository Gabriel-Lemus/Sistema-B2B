const INIT_TODO_SYMBOL = Symbol('INIT_TODO_SYMBOL')
const { ObjectId } = require('mongodb')

const SOURCE_COLLECTION = 'todos'

class Todo {
  static async init({ data, db }) {
    const todo = new Todo(INIT_TODO_SYMBOL)

    todo.data = {
      ...data,
      _id: data._id ? ObjectId(data._id) : ObjectId(),
    }

    todo.db = db

    const prevData = await todo.getPrevData()
    todo.prevData = prevData || {}

    return todo
  }

  constructor(token) {
    if (token !== INIT_TODO_SYMBOL) {
      throw new Error(
        `Can't initialize Todo via constructor; use Todo.init instead`
      )
    }
  }

  getPrevData() {
    return this.db
      .collection(SOURCE_COLLECTION)
      .findOne({ _id: this.data._id })
  }

  create(session, timestamp) {
    return this.db.collection('todos')
      .insertOne(
        { 
          description: '', 
          isDone: false, 
          createdOn: timestamp,
          updatedOn: timestamp,
        },
        { session },
      )
      .then(res => res.ops[0])
  }

  update(session, timestamp) {
    const { _id, description, isDone } = this.data

    return this.db.collection('todos')
      .findOneAndUpdate(
        { _id: ObjectId(_id) },
        { 
          $set: { 
            description, 
            isDone,
            updatedOn: timestamp,
          } 
        },
        { returnOriginal: false, session },
      )
      .then(({ value }) => value)
  }

  delete(session) {
    const { _id } = this.data

    return this.db.collection('todos')
      .findOneAndDelete(
        { _id: ObjectId(_id) },
        { session },
      )
      .then(({ value }) => value)
  }
}

module.exports = Todo
