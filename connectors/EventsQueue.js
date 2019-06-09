const async = require('async');
const logule = require('logule').init(module);

module.exports = class EventsQueue {
  constructor(callback) {
    this.Q = async.queue(callback);
  }

  distance(source, compare) {
    let lat1 = source.lat, lon1 = source.lon, lat2 = compare.lat, lon2 = compare.lon;
    var p = 0.017453292519943295;    // Math.PI / 180
    var c = Math.cos;
    var a = 0.5 - c((lat2 - lat1) * p)/2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p))/2;
  
    return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
  }

  push(events = []) {
    this.Q.push(events, err => err ? logule.error(err) : null);
  }

  setDrain(callback) {
    this.Q.drain = callback;
  }
  
}