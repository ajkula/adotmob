const async = require('async');
const logule = require('logule').init(module);

module.exports = class EventsQueue {
  constructor(callback) {
    this.Q = async.queue(callback);
  }

  push(events = []) {
    this.Q.push(events, err => err ? logule.error(err) : null);
  }

  setDrain(callback) {
    this.Q.drain = callback;
  }
  
}