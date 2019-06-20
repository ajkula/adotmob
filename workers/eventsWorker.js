'use strict'
const logule = require('logule').init(module);
const { parentPort, workerData, threadId } = require('worker_threads');
const p = 0.017453292519943295;    // Math.PI / 180
const cos = Math.cos;


const distance = (source, compare) => {
  let lat1 = source.lat, lon1 = source.lon, lat2 = compare.lat, lon2 = compare.lon;
  var a = 0.5 - cos((lat2 - lat1) * p)/2 + 
          cos(lat1 * p) * cos(lat2 * p) * 
          (1 - cos((lon2 - lon1) * p))/2;

  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
}

parentPort.on('error', (err) => { throw err });
parentPort.on('message', (dataContainer) => {

  if (dataContainer === "end") {
    parentPort.postMessage("ok")
  } else  {
  // logule.warn({threadId}, dataContainer);
  let distancesFromEventArray = dataContainer.poi.map(point => distance(dataContainer.event, point));
  let current = dataContainer.poi[distancesFromEventArray.indexOf(Math.min(...distancesFromEventArray))];
  parentPort.postMessage({event: dataContainer.event, current});
  }
});