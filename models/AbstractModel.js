let uuid = require('node-uuid');
const Promise = require('bluebird');
const logule = require('logule');

module.exports = class AbstractModel {
  /**
   * Abstract Database model
   * @param connector
   */
  constructor (connector) {
    this.connector = connector;
  }

  /**
   * Fetch a document from Database with ID of model
   * @param id
   * @return {Promise.<Map>}
   */
  findById (id) {
    return this.connector.get(id);
  }

  /**
   * Get collection of documents
   * @param ids
   * @return Collection of document
   */
  async findByMultipleId (ids) {
    let results = {};
    await Promise.map(ids, async (id) => {
      results[id] = await this.connector.get(id);
    });

    return results;
  }

  /**
   * Create or update a object in Database
   * @param id
   * @param data
   * @param options
   * @return {Promise}
   */
  save (id, data, options = {expiry: 0}) {
    return this.connector.save(id, data, options);
  }

  /**
   * Health check
   * @return {Promise}
   */
  async health () {
    const uid = uuid.v4();
    try {
      await this.save(uid, {id: uid, value: '42'}, {'expiry': 20});
      const result = await this.findById(uid);
      return ((result || {}).value || null) === '42';
    } catch (err) {
      logule.error(`Health error: ${err.message}`);
      return false;
    }
  }
}
