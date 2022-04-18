const Event = require('./Event/Event')
const { CREATE_ACTION } = require('./Event/actions')

class TodoCreateEvent extends Event {
  constructor(metadata, todo) {
    super(metadata)
    this.action = CREATE_ACTION
    this.entityId = todo.data._id

    this.entity = todo
    this.deltas = this.getDeltas()
  }

  process(session) {
    return this.entity.create(session, this.timestamp)
  }

  getDeltas() {
    return super.getDeltas({
      next: this.entity.data,
      excludedPaths: ['_id', 'createdOn', 'updatedOn'],
    })
  }
}

module.exports = TodoCreateEvent
