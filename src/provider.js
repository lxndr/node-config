/**
 * @abstract
 */
export default class ConfigProvider {
  constructor() {
    this.mutable = false;
  }

  /**
   * Loads from the source.
   * @returns {Promise<Object>}
   */
  load() {
  }
}
