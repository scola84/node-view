'use strict';

class Dispatcher {
  constructor(element, timeline, views, model, i18n) {
    this.elementProvider = element;
    this.timelineProvider = timeline;

    this.views = views;
    this.modelProvider = model;
    this.i18n = i18n;

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
        .build();
    }

    return view;
  }

  element() {
    return this.elementProvider.get();
  }

  model() {
    return this.modelProvider.get();
  }

  i18n(name) {
    return this.i18n.get(name);
  }

  count(prefix) {
    this.counter += 1;
    return prefix ? prefix + '-' + this.counter : this.counter;
  }
}

module.exports = Dispatcher;
