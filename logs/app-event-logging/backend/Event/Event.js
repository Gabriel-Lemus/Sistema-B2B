const _ = require('lodash')

class Event {
  constructor(metadata) {
    this.timestamp = new Date()
    this.userId = metadata.userId
    this.username = metadata.username
    this.action = null // options: 'updated', 'created', or 'deleted'
    this.entityId = null // child event will set
  }

  getDeltas({ prev = {}, next = {}, excludedPaths = [] }) {
    const prevKeys = Object.keys(prev).filter(key => !excludedPaths.includes(key))
    const nextKeys = Object.keys(next).filter(key => !excludedPaths.includes(key))

    const commonPaths = _.intersection(prevKeys, nextKeys)

    const commonFieldsWithChangedValues = commonPaths.reduce((acc, path) => {
      if (!_.isEqual(prev[path], next[path])) {
        acc.push({
          field: path,
          before: prev[path],
          after: next[path],
        })
      }

      return acc
    }, [])

    // what paths previously existed that aren't in the incoming paths?
    const noLongerExistingPaths = _.difference(prevKeys, nextKeys).map(
      path => ({
        field: path,
        before: prev[path],
        after: null,
      })
    )

    // what paths are in the incoming paths that weren't there before?
    const newPaths = _.difference(nextKeys, prevKeys).map(path => ({
      field: path,
      before: null,
      after: next[path],
    }))

    const result = [
      ...commonFieldsWithChangedValues,
      ...noLongerExistingPaths,
      ...newPaths,
    ]

    return result
  }
}

module.exports = Event
