/* eslint-disable class-methods-use-this */

/**
 * @abstract
 */
export default class ConfigProvider {
  mutable = false

  /**
   * Loads from the source.
   * @returns {Promise<Object>}
   */
  async load() {
    throw new Error('The load method is not implemented');
  }
}
