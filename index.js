'use strict';

const DI = require('@scola/di');

const Abstract = require('./lib/abstract');
const Dispatcher = require('./lib/dispatcher');
const Element = require('./lib/element');
const Model = require('./lib/model');

class Module extends DI.Module {
  configure() {
    this.inject(Dispatcher).with(
      this.provider(Element),
      this.provider(Model)
    );

    if (window) {
      this.inject(Element).with(
        this.value(window)
      );
    }
  }
}

module.exports = {
  Abstract,
  Dispatcher,
  Element,
  Model,
  Module
};
