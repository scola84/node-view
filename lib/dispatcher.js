'use strict';

const lodashMerge = require('lodash.merge');

class Dispatcher {
  constructor(views, element, window) {
    this.views = views;
    this.elementProvider = element;
    this.window = window;

    this.modelDispatcher = null;
    this.capabilityDispatcher = null;
    this.timelineProvider = null;
    this.i18n = null;

    this.optionMap = {};
  }

  getModelDispatcher() {
    return this.modelDispatcher;
  }

  setModelDispatcher(modelDispatcher) {
    this.modelDispatcher = modelDispatcher;
    return this;
  }

  getCapabilityDispatcher() {
    return this.capabilityDispatcher;
  }

  setCapabilityDispatcher(capabilityDispatcher) {
    this.capabilityDispatcher = capabilityDispatcher;
    return this;
  }

  getTimelineProvider() {
    return this.timelineProvider;
  }

  setTimelineProvider(timelineProvider) {
    this.timelineProvider = timelineProvider;
    return this;
  }

  getI18n() {
    return this.i18n;
  }

  setI18n(i18n) {
    this.i18n = i18n;
    return this;
  }

  options(options) {
    lodashMerge(this.optionMap, options);
    return this;
  }

  getOption(name) {
    return this.optionMap[name];
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
        .setCapabilityDispatcher(this.capabilityDispatcher)
        .setElementProvider(this.elementProvider)
        .setI18n(this.i18n)
        .setWindow(this.window)
        .build();
    }

    return view;
  }
}

module.exports = Dispatcher;
