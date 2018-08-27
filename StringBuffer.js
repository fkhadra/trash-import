class StringBuffer {
  constructor() {
    this.value = '';
  }

  append(value) {
    this.value = `${this.value} ${value}`;
  }

  isEmpty() {
    return this.value.length === 0;
  }

  clear() {
    this.value = '';
  }
}

module.exports = StringBuffer;
