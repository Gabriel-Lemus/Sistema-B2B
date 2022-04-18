const Event = require('./Event/Event')
const { UPDATE_ACTION } = require('./Event/actions')

class TodoUpdateEvent extends Event {
  constructor(metadata, todo) {
    super(metadata)
    this.action = UPDATE_ACTION
    this.entityId = todo.data._id

    this.entity = todo
    this.deltas = this.getDeltas()
  }

  process(session) {
    return this.entity.update(session, this.timestamp)
  }

  getDeltas() {
    return super.getDeltas({
      prev: this.entity.prevData,
      next: this.entity.data,
      excludedPaths: ['createdOn', 'updatedOn', '_id'],
    })
  }
}

module.exports = TodoUpdateEvent
