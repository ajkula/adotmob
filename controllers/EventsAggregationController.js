const Abstract = require('./Abstract');
const logule = require('logule').init(module);
const EventsQueue = require('../connectors/EventsQueue');

module.exports = class EventsAggregationController extends Abstract {
    constructor(container) {
			super(container);
			this.container = container;
			this.result = {};
			this.poi = [];

			this.healthy = this.get('healthCheck');
			const {events, EVENTS_ATTRIBUTES_MAPPING} = this.get('events');
			this.events = events;
			this.EVENTS_ATTRIBUTES_MAPPING = EVENTS_ATTRIBUTES_MAPPING;
			this.router.post('/', this.link.bind(this));
    }

    link(req, res) {
		console.time("Request bench")
		this.result = {};
		this.poi = [];
		this.queue = new EventsQueue(this.eachEvent.bind(this));
		const { body, headers } = req;
		if (headers['content-type'] !== 'application/json') {
			let message = `400 Bad Request: headers content-type: ${headers['content-type']}, expected: application/json`;
			logule.error(message);
			console.timeEnd("Request bench")
			logule.info(body);
			return res.json({status: 400, message});
		}
		if (!body || !body.poi)  {
			let message = `400 Bad Request: body.poi is undefined`;
			logule.error(message);
			console.timeEnd("Request bench")
			logule.info(body);
			return res.json({status: 400, message});
		}
		
		this.poi = body.poi;
		this.queue.push(this.events);
		this.queue.setDrain(err => {
			if (err) {
				logule.error(result);
				console.timeEnd("Request bench")
				logule.info(body);
				return res.json({status: 500, message: err});
			}
			logule.info(body);
			console.timeEnd("Request bench")
			return res.json(this.result);
		});
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
			let distancesFromEventArray = this.poi.map(point => this.distance(event, point));
			let current = this.poi[distancesFromEventArray.indexOf(Math.min(...distancesFromEventArray))];
			if (!(current || {}).name) logule.warn({
				current,
				i: distancesFromEventArray.indexOf(Math.min(...distancesFromEventArray)),
				dist_min: Math.min(...distancesFromEventArray),
				event
				});
			if ((this.result[current.name] || {})[this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]]) {
				this.result[current.name][this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]] += 1
			} else {
				this.result[current.name] = current;
				this.result[current.name][this.EVENTS_ATTRIBUTES_MAPPING[event.event_type]] = 1;
			}
		
			return callback();
		}
}
