export default {
  parse(text) {
    return JSON.parse(text);
  },

  stringify(value) {
    return JSON.stringify(value, ' ', 2);
  }
};
