let express = require('express')

module.exports = class AbstractController {
  constructor (container) {
    this.container = container
    this.router = express.Router()
  }

  get (serviceId) {
      console.log("get (" + serviceId + ")")
    return this.container[serviceId]
  }
}
