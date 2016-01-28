'use strict';

const EventHandler = require('@scola/events');

class Abstract extends EventHandler {
  constructor() {
    super();

    this.viewDispatcher = null;
    this.timeline = null;

    this.elements = new Map();
    this.views = new Map();
    this.models = new Map();
  }

  getViewDispatcher() {
    return this.viewDispatcher;
  }

  setViewDispatcher(dispatcher) {
    this.viewDispatcher = dispatcher;
    return this;
  }

  getTimeline() {
    return this.timeline;
  }

  setTimeline(timeline) {
    this.timeline = timeline;
    this.timeline.pause();
    return this;
  }

  build() {
    return this;
  }

  render() {}

  view(id, name) {
    if (name) {
      const view = this
        .viewDispatcher
        .get(name);

      if (!id) {
        return view;
      }

      this.views.set(id, view);
    }

    return this.views.get(id);
  }

  hasView(id) {
    return this.views.has(id);
  }

  removeView(id) {
    const view = this.views.get(id);
    this.views.delete(id);

    return view;
  }

  element(id, type) {
    if (type) {
      const element = this
        .viewDispatcher
        .element()
        .setView(this)
        .create(type, id);

      if (!id) {
        return element;
      }

      this.elements.set(id, element);
    }

    return this.elements.get(id);
  }

  hasElement(id) {
    return this.elements.has(id);
  }

  removeElement(id) {
    const element = this.elements.get(id);
    this.elements.delete(id);

    return element;
  }

  model(id, name) {
    if (name) {
      const model = this
        .viewDispatcher
        .model()
        .setName(name);

      if (!id) {
        return model;
      }

      this.models.set(id, model);
    }

    return this.models.get(id);
  }

  hasModel(id) {
    return this.models.has(id);
  }

  removeModel(id) {
    const model = this.models.get(id);
    this.models.delete(id);

    return model;
  }

  i18n(name) {
    return this.viewDispatcher.i18n(name);
  }

  count(prefix) {
    return this.viewDispatcher.count(prefix);
  }

  play(callback) {
    this.timeline
      .eventCallback(
        'onComplete',
        this.clear.bind(this, callback)
      )
      .play();

    return this;
  }

  clear(callback) {
    this
      .timeline
      .eventCallback('onComplete', null)
      .pause()
      .clear()
      .time(0);

    if (callback) {
      callback();
    }

    return this;
  }

  destroy() {
    this.views.forEach((view) => {
      view.destroy();
    });

    this.elements.forEach((element) => {
      element.destroy();
    });

    this.models.forEach((model) => {
      model.destroy();
    });

    if (this.timeline) {
      this.timeline.clear();
    }

    this.elements = {};
    this.views = {};
  }
}

module.exports = Abstract;
