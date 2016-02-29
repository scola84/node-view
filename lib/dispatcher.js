'use strict';

const lodashMerge = require('lodash.merge');

class Dispatcher {
  constructor(views, model, i18n, timeline, capabilities, element, window) {
    this.views = views;
    this.modelDispatcher = model;
    this.i18n = i18n;
    this.timelineProvider = timeline;
    this.capabilities = capabilities;
    this.elementProvider = element;
    this.window = window;

    this.optionMap = {};
  }

  get(name) {
    if (!this.views[name]) {
      throw new Error('@scola.view.not-found');
    }

    const view = this.views[name].get();

    if (!view.getViewDispatcher()) {
      if (this.timelineProvider) {
        view.setTimeline(this.timelineProvider.get());
      }

      view
        .setViewDispatcher(this)
        .setModelDispatcher(this.modelDispatcher)
        .setI18n(this.i18n)
        .setCapabilities(this.capabilities)
        .setElementProvider(this.elementProvider)
        .setWindow(this.window)
        .build();
    }

    return view;
  }

  options(options) {
    lodashMerge(this.optionMap, options);
    return this;
  }

  getOption(name) {
    return this.optionMap[name];
  }
}

module.exports = Dispatcher;
