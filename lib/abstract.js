'use strict';

const EventHandler = require('@scola/events');

class AbstractView extends EventHandler {
  constructor() {
    super();

    this.viewDispatcher = null;
    this.i18n = null;
    this.window = null;
    this.timeline = null;
    this.parent = null;

    this.elements = new Map();
    this.views = new Map();
    this.models = new Map();
    this.optionMap = {};
  }

  getViewDispatcher() {
    return this.viewDispatcher;
  }

  setViewDispatcher(dispatcher) {
    this.viewDispatcher = dispatcher;
    return this;
  }

  getI18n() {
    return this.i18n;
  }

  setI18n(i18n) {
    this.i18n = i18n;
    return this;
  }

  getWindow() {
    return this.window;
  }

  setWindow(window) {
    this.window = window;
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

  getParent() {
    return this.parent;
  }

  setParent(parent) {
    this.parent = parent;
    return this;
  }

  build() {
    return this;
  }

  render() {}

  view(id, name) {
    if (name) {
      if (id && this.views.has(id)) {
        throw new Error('@scola.view.exists');
      }

      const view = this
        .viewDispatcher
        .get(name);

      if (!view.getParent()) {
        view.setParent(this);
      }

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

  removeViewObject(view) {
    this.views.forEach((item, id) => {
      if (item === view) {
        this.removeView(id);
      }
    });

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
        .model(name);

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

  options(options) {
    Object.assign(this.optionMap, options);
    return this;
  }

  getOption(name) {
    return this.optionMap[name];
  }

  capability(name) {
    return this.viewDispatcher.capability(name);
  }

  count(prefix) {
    return this.viewDispatcher.count(prefix);
  }

  play(callback) {
    if (this.timeline) {
      this.timeline
        .eventCallback(
          'onComplete',
          this.clear.bind(this, callback)
        )
        .play();
    }

    return this;
  }

  clear(callback) {
    if (this.timeline) {
      this
        .timeline
        .eventCallback('onComplete', null)
        .pause()
        .clear()
        .time(0);
    }

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
      model.unlisten(this);
    });

    if (this.timeline) {
      this.timeline.clear();
    }

    if (this.parent) {
      this.parent.removeViewObject(this);
    }

    this.views.clear();
    this.elements.clear();
    this.models.clear();
  }
}

module.exports = AbstractView;
