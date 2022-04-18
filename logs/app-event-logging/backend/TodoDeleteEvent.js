const Event = require('./Event/Event')
const { DELETE_ACTION } = require('./Event/actions')

class TodoDeleteEvent extends Event {
  constructor(metadata, todo) {
    super(metadata)
    this.action = DELETE_ACTION
    this.entityId = todo.data._id

    this.entity = todo
    this.deltas = this.getDeltas()
  }

  process(session) {
    return this.entity.delete(session, this.timestamp)
  }

  getDeltas() {
    return super.getDeltas({
      prev: this.entity.prevData,
      excludedPaths: ['createdOn', 'updatedOn', '_id'],
    })
  }
}

module.exports = TodoDeleteEvent
