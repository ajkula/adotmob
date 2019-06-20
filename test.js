const {
	Worker,
	isMainThread,
	parentPort,
	workerData,
} = require('worker_threads');




const src = {
  aze: {
    id: "aze",
    count: 10,
  },
  qsd: {
    id: "qsd",
    count: 5,
    value: 10,
  },
  wxc: {
    id: "wxc",
    value: 5,
  },
}

const out = {
  aze: {
    id: "aze",
    count: 10,
    value: 5,
  },
  qsd: {
    id: "qsd",
    count: 5,
    value: 10,
  },
  tyu: {
    id: "tyu",
    value: 5,
    count: 10,
  },
}


const aggregate2Objects = (src, out) => {
  let res = {};

  const workWithTypes = (valA, valB) => {
    if (valA !== undefined && typeof valA === "string") { return valA; }
    if (valB !== undefined && typeof valB === "string") { return valB; }
    
    if (valA !== undefined && typeof valA === "number" ||
    valB !== undefined && typeof valB === "number") {
      return (valA || 0) + (valB || 0);
    }
  }
  
  Object.keys(Object.assign({}, src, out)).forEach(key => {
    res[key] = {};
    if (src[key] && out[key]) {
      let compare = Object.assign({}, src[key], out[key]);
      for (let attribute in compare) {
        res[key][attribute] = workWithTypes(src[key][attribute], out[key][attribute]);
      }
    } else {
      res[key] = src[key] ? src[key] : out[key];
    }
  });
  
  return res;
}
// console.log(aggregate2Objects(src, out));


const workerify = () => {
  if (isMainThread) {
    // This code is executed in the main thread and not in the worker.
    
    // Create the worker.
    const worker = new Worker(__filename);
    // Listen for messages from the worker and print them.
    worker.on('message', (msg) => { console.log('message', msg); });
  } else {
    // This code is executed in the worker and not in the main thread.
    
    // Send a message to the main thread.
    parentPort.postMessage();
  }
}

const arr = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24];
const divider = 3;
const step = Math.ceil(arr.length / divider);
const start = 0, end = step;

console.log(step)
console.log(arr.values())
while (arr.length) {
  
  console.log(arr.splice(start, end))
}

