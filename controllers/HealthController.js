let AbstractController = require('./Abstract')

module.exports = class HealthController extends AbstractController {

  constructor(container) {
    super(container)

    this.container = container;
    this.healthCheck = this.get('healthCheck');
    // Load routes
    this.router.get('/health', this.checkHealth.bind(this))
  }

  /**
   * Check health
   * @param req
   * @param res
   */
  async checkHealth(req, res) {
    // const status = await this.anyModel // some async call
    res.json({status: this.healthCheck})
  }
}
