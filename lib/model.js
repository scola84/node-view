'use strict';

const EventHandler = require('@scola/events');

class Model extends EventHandler {
  constructor(model) {
    super();

    this.model = model;
    this.name = null;

    this.iterateMethod = null;
    this.bindMethod = null;
    this.emptyMethod = null;

    this.addHandlers();
  }

  getName() {
    return this.model.getName();
  }

  setName(name) {
    this.model.setName(name);
    return this;
  }

  addHandlers() {
    this.model.listen({
      select: this.handleSelect,
      error: this.handleError
    }, this);
  }

  handleError(error) {
    console.log('modelerror', error);
  }

  handleSelect(data) {
    if (this.iterateMethod) {
      this.handleIterate(data);
    } else if (this.bindMethod) {
      this.handleBind(data);
    }
  }

  handleBind(data) {
    this.bindMethod(data);
  }

  handleIterate(data) {
    console.log(data);
    if (data.length === 0) {
      return this.emptyMethod && this.emptyMethod();
    }

    data.forEach((item) => {
      this.iterateMethod(item);
    });
  }

  iterate(iterateMethod) {
    this.iterateMethod = iterateMethod;
    return this;
  }

  bind(bindMethod) {
    this.bindMethod = bindMethod;
    return this;
  }

  empty(empty) {
    this.emptyMethod = empty;
    return this;
  }

  select(...args) {
    this.model.select(...args);
    return this;
  }

  insert(...args) {
    this.model.insert(...args);
    return this;
  }

  update(...args) {
    this.model.update(...args);
    return this;
  }

  delete(...args) {
    this.model.delete(...args);
    return this;
  }
}

module.exports = Model;
