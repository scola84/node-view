'use strict';

class Dispatcher {
  constructor(views, model, i18n, timeline, capabilities, element) {
    this.views = views;
    this.modelDispatcher = model;
    this.i18n = i18n;
    this.timelineProvider = timeline;
    this.elementProvider = element;
    this.capabilitiesTester = capabilities;

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

  model(name) {
    return this.modelDispatcher.get(name);
  }

  i18n(name) {
    return this.i18n.get(name);
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
