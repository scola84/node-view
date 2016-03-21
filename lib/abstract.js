'use strict';

const EventHandler = require('@scola/events');

class AbstractView extends EventHandler {
  constructor() {
    super();

    this.viewDispatcher = null;
    this.elementProvider = null;
    this.modelDispatcher = null;
    this.capabilityDispatcher = null;
    this.router = null;
    this.timeline = null;
    this.i18n = null;

    this.window = null;
    this.parent = null;

    this.views = new Map();
    this.elements = new Map();
    this.models = new Map();
    this.options = new Map();
  }

  getViewDispatcher() {
    return this.viewDispatcher;
  }

  setViewDispatcher(dispatcher) {
    this.viewDispatcher = dispatcher;
    return this;
  }

  getElementProvider() {
    return this.elementProvider;
  }

  setElementProvider(elementProvider) {
    this.elementProvider = elementProvider;
    return this;
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

  getRouter() {
    return this.router;
  }

  setRouter(router) {
    this.router = router;
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

  find(path) {
    path = path || '';

    if (path.length === 0) {
      return this;
    }

    const parts = path.split('.');

    return this.views
      .get(parts[0])
      .find(parts.slice(1).join('.'));
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
        .elementProvider
        .get()
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
      const model = this.modelDispatcher.get(name);

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

  capability(name) {
    return this.capabilityDispatcher ?
      this.capabilityDispatcher.get(name).test() :
      false;
  }

  route(path, push) {
    return this.router ?
      this.router.route(path, push) :
      false;
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

  option(name, value) {
    this.options.set(name, value);
    return this;
  }

  getOption(name) {
    return this.options.get(name);
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

    if (this.i18n) {
      this.unbindListener('locale', this.i18n, this.handleLocale);
      this.unbindListener('timezone', this.i18n, this.handleTimezone);
    }

    if (this.timeline) {
      this.timeline.clear();
    }

    if (this.parent) {
      this.parent.removeViewObject(this);
    }

    this.views.clear();
    this.elements.clear();
    this.models.clear();

    this.viewDispatcher = null;
  }
}

module.exports = AbstractView;
