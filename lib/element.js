'use strict';

const EventHandler = require('@scola/events');
const Reflect = require('harmony-reflect');

class Element extends EventHandler {
  constructor(window) {
    super();

    this.window = window;

    this.node = null;
    this.view = null;
    this.matcher = null;
    this.matchers = [];
    this.events = new Map();

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
    this.node = this.window.document.createElement(type);
    this.node.id = this.view.count(id);
    this.matcher = null;

    return this;
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

  match(query) {
    this.matcher = this.window.matchMedia(query);
    return this;
  }

  matchAll(query) {
    this.match(query);
    this.matcher.all = true;

    return this;
  }

  properties(definition) {
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

    if (typeof properties === 'string') {
      properties = this.view.getProperties(properties);
    }

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

    if (typeof style === 'string') {
      style = this.view.getStyles(style);
    }

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

  listen(definition, context) {
    context = context || this;

    return this.setListeners(
      definition,
      context,
      this.bindMatcher(
        this.handleMatchListen,
        definition,
        context
      )
    );
  }

  handleMatchListen(definition, context, matcher) {
    return this.setListeners(definition, context, matcher.matches);
  }

  setListeners(definition, context, set) {
    Object.keys(definition).forEach((name) => {
      if (set) {
        context.bindListener(name, this.node, definition[name]);
        this.events.set(name, {
          context,
          name,
          listener: definition[name]
        });
      } else {
        context.unbindListener(name, this.node, definition[name]);
        this.events.delete(name);
      }
    });

    return this;
  }

  animate(definition) {
    return this.setAnimation(
      definition,
      this.bindMatcher(
        this.handleMatchAnimate,
        definition
      )
    );
  }

  handleMatchAnimate(definition, matcher) {
    return this.setAnimation(Object.assign({}, definition, {
      play: true
    }), matcher.matches);
  }

  setAnimation(definition, set) {
    if (!set) {
      return this;
    }

    definition = Object.assign({}, definition);

    const play = definition.play;
    const timeline = this.view.getTimeline();

    const duration =
      typeof definition.duration !== 'undefined' ?
      definition.duration / 1000 :
      150 / 1000;

    const position =
      typeof definition.stagger !== 'undefined' && timeline.duration() ?
      timeline.recent().startTime() + (definition.stagger / 1000) :
      null;

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
    delete definition.stagger;
    delete definition.easeConfig;
    delete definition.repeat;

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
    element.appendTo(this);
    return this;
  }

  appendTo(element) {
    element.get().appendChild(this.node);
    return this.emit('append');
  }

  bindMatcher(listener, definition) {
    if (this.matcher) {
      this.bindListener(
        null,
        this.matcher,
        listener,
        definition
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

  emit(name, ...args) {
    if (this.events.has(name)) {
      const event = this.events.get(name);
      Reflect.apply(event.listener, event.context, args);
    }

    return this;
  }

  destroy() {
    this.emit('destroy');

    this.events.forEach((item) => {
      item.context.unbindListener(item.name, this.node, item.listener);
    });

    this.matchers.forEach((item) => {
      this.unbindListener(null, item.matcher, item.listener);
    });

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
