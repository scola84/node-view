'use strict';

const EventHandler = require('@scola/events');

class Element extends EventHandler {
  constructor(window) {
    super();

    this.window = window;

    this.id = null;
    this.node = null;
    this.view = null;

    this.test = true;
    this.matcher = null;
    this.matchers = [];

    this.events = new Map();
    this.dataMap = new Map();

    this.propertiesHistory = {};
    this.styleHistory = {};
  }

  element(...args) {
    return this.view.element(...args);
  }

  view(...args) {
    return this.view.view(...args);
  }

  create(type, id) {
    this.id = id;
    this.node = this.window.document.createElement(type);
    this.node.id = this.view.count(id);

    return this;
  }

  getId() {
    return this.id;
  }

  get() {
    return this.node;
  }

  setNode(node) {
    this.node = node;
    return this;
  }

  getView() {
    return this.view;
  }

  setView(view) {
    this.view = view;
    return this;
  }

  data(key, value) {
    if (typeof value !== 'undefined') {
      this.dataMap.set(key, value);
      return this;
    }

    return this.dataMap.get(key);
  }

  hasData(key) {
    return this.dataMap.has(key);
  }

  removeData(key) {
    this.dataMap.delete(key);
    return this;
  }

  match(query) {
    this.matcher = this.window.matchMedia(query);
    return this;
  }

  matchAll(query) {
    this.match(query);
    this.matcher.all = true;

    return this;
  }

  if (test) {
    this.test = Boolean(test);
    return this;
  }

  should() {
    const test = this.test;
    this.test = true;

    return test;
  }

  properties(definition) {
    if (!this.should()) {
      return this;
    }

    return this.setProperties(
      definition,
      this.bindMatcher(
        this.handleMatchProperties,
        definition
      )
    );
  }

  handleMatchProperties(definition, matcher) {
    return this.setProperties(definition, matcher.matches);
  }

  setProperties(definition, set) {
    let properties = definition;

    if (typeof properties === 'function') {
      properties = properties(this);
    }

    Object.keys(properties).forEach((key) => {
      if (set) {
        this.propertiesHistory[key] = {
          definer: definition,
          value: properties[key]
        };

        this.node[key] = properties[key];
      } else if (this.propertiesHistory[key] &&
        this.propertiesHistory[key].definer !== definition) {
        this.node[key] = this.propertiesHistory[key].value;
      } else {
        this.node[key] = null;
      }
    });

    return this;
  }

  style(definition) {
    if (!this.should()) {
      return this;
    }

    return this.setStyle(
      definition,
      this.bindMatcher(
        this.handleMatchStyle,
        definition
      )
    );
  }

  handleMatchStyle(definition, matcher) {
    return this.setStyle(definition, matcher.matches);
  }

  setStyle(definition, set) {
    let style = definition;

    if (typeof style === 'function') {
      style = style(this);
    }

    Object.keys(style).forEach((key) => {
      if (set) {
        this.styleHistory[key] = {
          definer: definition,
          value: style[key]
        };

        this.node.style[key] = style[key];
      } else if (this.styleHistory[key] &&
        this.styleHistory[key].definer !== definition) {
        this.node.style[key] = this.styleHistory[key].value;
      } else {
        this.node.style[key] = null;
      }
    });

    return this;
  }

  listen(definition, context, ...extra) {
    if (!this.should()) {
      return this;
    }

    extra = extra.concat(this);

    return this.setListeners(
      definition,
      context,
      extra,
      this.bindMatcher(
        this.handleMatchListen,
        definition,
        context,
        extra
      )
    );
  }

  handleMatchListen(definition, context, extra, matcher) {
    return this.setListeners(definition, context, extra, matcher.matches);
  }

  setListeners(definition, context, extra, set) {
    if (set) {
      this.events.set(context, definition);
    } else {
      this.events.delete(context);
    }

    Object.keys(definition).forEach((name) => {
      if (set) {
        context.bindListener(name, this.node, definition[name], ...extra);
      } else {
        context.unbindListener(name, this.node, definition[name]);
      }
    });

    return this;
  }

  animate(definition, context) {
    if (!this.should()) {
      return this;
    }

    return this.setAnimation(
      definition,
      context,
      this.bindMatcher(
        this.handleMatchAnimate,
        definition,
        context
      )
    );
  }

  handleMatchAnimate(definition, context, matcher) {
    return this.setAnimation(Object.assign({}, definition, {
      play: true
    }), context, matcher.matches);
  }

  setAnimation(definition, context, set) {
    if (!set) {
      return this;
    }

    definition = Object.assign({}, definition);
    context = context || this.view;

    const play = definition.play;
    const timeline = context.getTimeline();
    let position = null;

    const duration =
      typeof definition.duration !== 'undefined' ?
      definition.duration / 1000 :
      150 / 1000;

    position = definition.position !== 'undefined' ?
      definition.position :
      position;

    position =
      typeof definition.stagger !== 'undefined' && timeline.duration() ?
      timeline.recent().startTime() + (definition.stagger / 1000) :
      position;

    definition.ease = definition.ease ?
      this.window.EaseLookup.find(definition.ease) :
      null;

    if (definition.easeConfig) {
      definition.ease = definition.ease.config(...definition.easeConfig);
    }

    if (definition.repeat) {
      timeline.repeat(definition.repeat);
    }

    delete definition.play;
    delete definition.duration;
    delete definition.position;
    delete definition.stagger;
    delete definition.easeConfig;
    delete definition.repeat;

    if (!timeline) {
      delete definition.ease;

      Object.keys(definition).forEach((key) => {
        this.node.style[key] = definition[key];
      });

      return this;
    }

    timeline.to(
      this.node,
      duration,
      definition,
      position
    );

    if (play) {
      this.view.play();
    }

    return this;
  }

  append(element) {
    this.node.appendChild(element.get());
    element.emit('append', this);

    return this;
  }

  appendTo(element) {
    element.append(this);
    return this;
  }

  appendView(...args) {
    const view = this.view.view(...args);
    this.append(view.render());

    return view;
  }

  detach(element) {
    this.node.removeChild(element.get());
    element.emit('remove', this);

    return this;
  }

  getDimensions() {
    return {
      height: this.node.offsetHeight,
      width: this.node.offsetWidth
    };
  }

  getPosition() {
    const position = {
      x: 0,
      y: 0
    };

    let node = this.node;

    while (node) {
      position.x += node.offsetLeft - node.scrollLeft + node.clientLeft;
      position.y += node.offsetTop - node.scrollTop + node.clientTop;
      node = node.offsetParent;
    }

    return position;
  }

  bindMatcher(listener, ...extra) {
    if (this.matcher) {
      this.bindListener(
        null,
        this.matcher,
        listener,
        ...extra
      );

      this.matchers.push({
        matcher: this.matcher,
        listener
      });

      const matches = this.matcher.matches;

      if (!this.matcher.all) {
        this.matcher = null;
      }

      return matches;
    }

    return true;
  }

  emit(name, details) {
    const event = new Event(name);
    event.details = details;

    this.node.dispatchEvent(event);

    return this;
  }

  destroy() {
    this.emit('destroy');

    this.events.forEach((events, context) => {
      Object.keys(events).forEach((name) => {
        context.unbindListener(name, this.node, events[name]);
      });
    });

    this.matchers.forEach((item) => {
      this.unbindListener(null, item.matcher, item.listener);
    });

    this.view.removeElement(this.getId());
    this.node.remove();

    this.window = null;
    this.node = null;
    this.view = null;
    this.matcher = null;
    this.matchers = null;
    this.events = null;
  }
}

module.exports = Element;
