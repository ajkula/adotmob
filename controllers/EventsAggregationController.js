const Abstract = require('./Abstract');
const logule = require('logule').init(module);
const EventsQueue = require('../connectors/EventsQueue');
const { MessagePort, Worker, workerData, threadId, parentPort } = require('worker_threads');

module.exports = class EventsAggregationController extends Abstract {
	constructor(container) {
		super(container);
		this.container = container;
		this.result = {};
		this.poi = [];
		this.tog = true;
		this.workers = {
			// 0: this.createWorker({workerData: {id: 0}}),
			// 1: this.createWorker({workerData: {id: 1}}),
			0: new Worker('./workers/eventsWorker.js'),
			1: new Worker('./workers/eventsWorker.js'),
		}

		this.healthy = this.get('healthCheck');
		const {events, EVENTS_ATTRIBUTES_MAPPING} = this.get('events');
		this.events = events;
		this.EVENTS_ATTRIBUTES_MAPPING = EVENTS_ATTRIBUTES_MAPPING;
		this.router.post('/', this.link.bind(this));
	}
	
	toggle() { this.tog =!this.tog; return Number(this.tog) }

	link(req, res) {
		console.time("Request bench")
		this.result = {};
		this.poi = [];
		this.queue = new EventsQueue(this.eachEvent.bind(this), 2);
		const { body, headers } = req;
		if (headers['content-type'] !== 'application/json') {
			let message = `400 Bad Request: headers content-type: ${headers['content-type']}, expected: application/json`;
			logule.error(message);
			console.timeEnd("Request bench")
			return res.json({status: 400, message});
		}
		if (!body || !body.poi)  {
			let message = `400 Bad Request: body.poi is undefined`;
			logule.error(message);
			console.timeEnd("Request bench")
			return res.json({status: 400, message});
		}
		
		this.poi = body.poi;
		this.queue.push(this.events);

		
		this.workers[0].on("message", (results) => {

			if (results === "ok") {
				return res.json(this.result);
			} else {
				let {event, current} = results;
				if ((this.result[current.name] || {})[this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]]) {
					this.result[current.name][this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]] += 1
				} else {
					this.result[current.name] = current;
					this.result[current.name][this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]] = 1;
				}
			}

		});
		

		this.workers[1].on("message", ({event, current}) => {
			if ((this.result[current.name] || {})[this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]]) {
				this.result[current.name][this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]] += 1
			} else {
				this.result[current.name] = current;
				this.result[current.name][this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]] = 1;
			}
		});
		
		this.queue.setDrain(err => {
			if (err) {
				logule.error(err, {result: this.result});
				console.timeEnd("Request bench");
				return res.json({status: 500, message: err});
			}
			console.timeEnd("Request bench");
			this.workers[0].postMessage("end");
		});
	}

	createWorker (workerData) {
		const worker = new Worker('./workers/eventsWorker.js', { workerData })
		// worker.on('message', callback);
		return worker;
	}
	
	distance(source, compare) {
		let lat1 = source.lat, lon1 = source.lon, lat2 = compare.lat, lon2 = compare.lon;
		const p = 0.017453292519943295;    // Math.PI / 180
		const c = Math.cos;
		let a = 0.5 - c((lat2 - lat1) * p)/2 + 
						c(lat1 * p) * c(lat2 * p) * 
						(1 - c((lon2 - lon1) * p))/2;
	
		return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
	}
		
	eachEvent(event, callback) {
		// let distancesFromEventArray = this.poi.map(point => this.distance(event, point));
		// let distancesFromEventArray = [];

		let id = this.toggle();
		const { poi } = this;
		this.workers[id].postMessage({event, poi});
		// let current = this.poi[distancesFromEventArray.indexOf(Math.min(...distancesFromEventArray))];
		
		
		// if (!(current || {}).name) logule.warn({
			// 	current,
			// 	i: distancesFromEventArray.indexOf(Math.min(...distancesFromEventArray)),
			// 	dist_min: Math.min(...distancesFromEventArray),
			// 	event
			// });
			
			return callback();
	}
}
