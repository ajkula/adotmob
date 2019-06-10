const express = require('express');
// const RawBodyParser = require('./parserTest');
const bodyParser = require('body-parser');
const fs = require('fs');

module.exports = class Server {

    /**
     * Init Server
     */
    constructor () {
      this.app = express();
      this.app.use(bodyParser.json());

      /**
       * Init the dependencies container
       */
      this.container = {};

      /**
       * ADOTMOB Events CSV utilities
       */
      
      const EVENTS_ATTRIBUTES_MAPPING = {
        imp: "impressions",
        click: "clicks",
      };
      let events = fs.readFileSync('./csv/events.csv').toString().split('\n');
      let headers = events.shift().split(',');
      events = events.map(e => {let cols = e.split(','); return { [headers[0]]: cols[0], [headers[1]]: cols[1], [headers[2]]: cols[2], } })
                     .filter(e => e.event_type ? true : false);

      /**
      * Will be used to mock health routes' dependencies
      */
      const CSV_EXISTS = {isReady: fs.existsSync('./csv/events.csv'), hasEvents: events.length > 0};

      /**
       * Adding the healthCheck datas to container
       */
      this.container['events'] = {events, EVENTS_ATTRIBUTES_MAPPING};
      this.container['healthCheck'] = CSV_EXISTS;

      /**
       *  Only for GRPC-type coms
       */
      // this.app.use(RawBodyParser);

      /**
       * Load all controllers dynamically
       */
      this.loadControllers();
      
    }

    /**
     * Load Http controllers
     */
    loadControllers () {
      const files = fs.readdirSync(__dirname + '/controllers/');
      files.forEach((file) => {
        if (/Controller\.js/.test(file)) {
          const classCtrl = require(__dirname + '/controllers/' + file);
          console.log(__dirname + '/controllers/' + file);
          this.app.use(new classCtrl(this.container).router);
        }
      });
    }
}