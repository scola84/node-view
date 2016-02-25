'use strict';

class Dispatcher {
  constructor(views, model, i18n, timeline, capabilities, element, window) {
    this.views = views;
    this.modelDispatcher = model;
    this.i18n = i18n;
    this.timelineProvider = timeline;
    this.capabilitiesTester = capabilities;
    this.elementProvider = element;
    this.window = window;

    this.counter = 0;
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
        .setI18n(this.i18n)
        .setWindow(this.window)
        .build();
    }

    return view;
  }

  element() {
    return this.elementProvider.get();
  }

  model(name) {
    return this.modelDispatcher.get(name);
  }

  capability(name) {
    return this.capabilitiesTester.test(name);
  }

  count(prefix) {
    this.counter += 1;
    return prefix ? prefix + '-' + this.counter : this.counter;
  }
}

module.exports = Dispatcher;
