'use strict';

const DI = require('@scola/di');

const Abstract = require('./lib/abstract');
const Dispatcher = require('./lib/dispatcher');
const Element = require('./lib/element');

class Module extends DI.Module {
  configure() {
    this.inject(Dispatcher)
      .insertArgument(1, this.provider(Element));

    if (window) {
      this.inject(Dispatcher)
        .insertArgument(2, this.value(window));

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
  Module
};
