(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.pw = factory());
}(this, function () { 'use strict';

  function broadcast (channel, payload) {
    pw.Component.broadcast(channel, payload);
  }

  function define (name, object) {
    var component = pw.Component.create();

    for (var method in Object.getOwnPropertyDescriptors(object)) {
      Object.defineProperty(component.prototype, method, Object.getOwnPropertyDescriptor(object, method));
    }

    pw.Component.register(name, component);
  }

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var unsent = [];

  var _default =
  /*#__PURE__*/
  function () {
    function _default() {
      _classCallCheck(this, _default);
    }

    _createClass(_default, null, [{
      key: "install",
      value: function install() {
        var original = window.console;
        window.console = {
          log: function log() {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }

            pw.logger.log.apply(null, ["unknown", "log"].concat(args));
            original.log.apply(null, args);
          },
          debug: function debug() {
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }

            pw.logger.log.apply(null, ["debug", null].concat(args));
            original.debug.apply(null, args);
          },
          info: function info() {
            for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
              args[_key3] = arguments[_key3];
            }

            pw.logger.log.apply(null, ["info", null].concat(args));
            original.info.apply(null, args);
          },
          warn: function warn() {
            for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
              args[_key4] = arguments[_key4];
            }

            pw.logger.log.apply(null, ["warn", null].concat(args));
            original.warn.apply(null, args);
          },
          error: function error() {
            for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
              args[_key5] = arguments[_key5];
            }

            pw.logger.log.apply(null, ["error", null].concat(args));
            original.error.apply(null, args);
          }
        };

        for (var prop in original) {
          if (!window.console.hasOwnProperty(prop)) {
            window.console[prop] = original[prop];
          }
        }
      }
    }, {
      key: "flush",
      value: function flush() {
        var message;

        while (message = unsent.shift()) {
          this.log.apply(null, [message[0], message[1]].concat(message[2]));
        }
      }
    }, {
      key: "log",
      value: function log(severity, method) {
        for (var _len6 = arguments.length, messages = new Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
          messages[_key6 - 2] = arguments[_key6];
        }

        if (pw.server.socket && pw.server.reachable) {
          for (var _i = 0, _messages = messages; _i < _messages.length; _i++) {
            var message = _messages[_i];
            pw.server.socket.send({
              severity: severity,
              message: message
            }, "log");
          }
        } else {
          unsent.push([severity, method || severity, messages]);
        }
      }
    }]);

    return _default;
  }();

  function ready (callback) {
    if (document.readyState === "interactive" || document.readyState === "complete") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function send (url) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var id = new Date().getTime();

    if (!options.cache) {
      url += (-1 == url.indexOf("?") ? "?" : "&") + "_=" + id;
    }

    var method = options.method || "GET";
    var xhr = new XMLHttpRequest();
    xhr.id = id;
    xhr.open(method, url);
    xhr.setRequestHeader("pw-ui", pw.version);

    for (var header in options.headers || {}) {
      xhr.setRequestHeader(header, options.headers[header]);
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        var status = xhr.status;

        if (status >= 200 && (status < 300 || status === 304)) {
          if (options.success) {
            options.success(xhr, xhr.responseText);
          }
        } else {
          if (options.error) {
            options.error(xhr, xhr.statusText);
          }
        }

        if (options.complete) {
          options.complete(xhr);
        }
      }
    };

    xhr.onprogress = function (event) {
      if (options.progress) {
        options.progress(event);
      }
    };

    var data = options.data;

    if (!(data instanceof FormData)) {
      if (method !== "GET") {
        var $token = document.querySelector("meta[name='pw-authenticity-token']");
        var $param = document.querySelector("meta[name='pw-authenticity-param']");

        if ($token && $param) {
          if (!data || !data[$param.getAttribute("content")]) {
            if (!data) {
              data = {};
            }

            data[$param.getAttribute("content")] = $token.getAttribute("content");
          }
        }
      }

      if (data) {
        xhr.setRequestHeader("content-type", "application/json");
        data = JSON.stringify(data);
      } else {
        xhr.setRequestHeader("accept", "text/html");
      }
    }

    xhr.send(data);
    return xhr;
  }

  var reachable = false;
  var socket;

  var _default$1 =
  /*#__PURE__*/
  function () {
    function _default() {
      _classCallCheck(this, _default);
    }

    _createClass(_default, null, [{
      key: "reachable",
      get: function get() {
        return reachable;
      },
      set: function set(value) {
        reachable = !!value;
      }
    }, {
      key: "socket",
      get: function get() {
        return socket;
      },
      set: function set(value) {
        socket = value;
      }
    }]);

    return _default;
  }();

  var modifierKeyPressed = false;
  document.documentElement.addEventListener("keydown", function (event) {
    if (event.metaKey || event.crtlKey || event.altKey || event.shiftKey) {
      modifierKeyPressed = true;
    }
  });
  document.documentElement.addEventListener("keyup", function (event) {
    if (!event.metaKey && !event.crtlKey && !event.altKey && !event.shiftKey) {
      modifierKeyPressed = false;
    }
  });
  var currentNavigator;

  var _default$2 =
  /*#__PURE__*/
  function () {
    function _default() {
      _classCallCheck(this, _default);
    }

    _createClass(_default, null, [{
      key: "navigableVia",
      value: function navigableVia(navigatorObject) {
        currentNavigator = navigatorObject;
      }
    }, {
      key: "visit",
      value: function visit(url, xhr) {
        if (currentNavigator) {
          currentNavigator.visit(url, xhr);
        } else {
          document.location = url;
        }
      }
    }, {
      key: "modifierKeyPressed",
      get: function get() {
        return modifierKeyPressed;
      }
    }, {
      key: "info",
      set: function set(values) {
        if (this.__system_info && this.__system_info.version !== values.version) {
          pw.broadcast("pw:ui:stale", values);
        }

        this.__system_info = values;
      },
      get: function get() {
        return this.__system;
      }
    }]);

    return _default;
  }();

  var version = "1.1.0-alpha.2";

  var wakes = []; // Wake detection inspired by Alex MacCaw:
  //   https://blog.alexmaccaw.com/javascript-wake-event

  var wakeTimeout = 10000;
  var lastKnownTime = new Date().getTime();
  setInterval(function () {
    var currentTime = new Date().getTime();

    if (currentTime > lastKnownTime + wakeTimeout + 1000) {
      wakes.forEach(function (fn) {
        fn();
      });
    }

    lastKnownTime = currentTime;
  }, wakeTimeout);
  function wake (callback) {
    wakes.push(callback);
  }

  var _default$3 =
  /*#__PURE__*/
  function () {
    function _default(attribute, view) {
      _classCallCheck(this, _default);

      this.attribute = attribute;
      this.view = view;
    }

    _createClass(_default, [{
      key: "add",
      value: function add(value) {
        this.view.node.classList.add(value);
      }
    }, {
      key: "delete",
      value: function _delete(value) {
        this.view.node.classList.remove(value);
      }
    }, {
      key: "clear",
      value: function clear() {
        this.view.node.setAttribute("class", "");
      }
    }]);

    return _default;
  }();

  var _default$4 =
  /*#__PURE__*/
  function () {
    function _default(attribute, view) {
      _classCallCheck(this, _default);

      this.attribute = attribute;
      this.view = view;
    }

    _createClass(_default, [{
      key: "set",
      value: function set(part, value) {
        this.view.node.style[part] = value;
      }
    }, {
      key: "replace",
      value: function replace(value) {
        this.view.node.style = {};

        for (var key in value) {
          this.set(key, value[key]);
        }
      }
    }, {
      key: "delete",
      value: function _delete(part) {
        this.view.node.style[part] = null;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.view.node.setAttribute("style", "");
      }
    }]);

    return _default;
  }();

  var _default$5 = function _default(attribute, view) {
    _classCallCheck(this, _default);

    this.attribute = attribute;
    this.view = view;
  };

  var _default$6 = function _default(attribute, view) {
    _classCallCheck(this, _default);

    this.attribute = attribute;
    this.view = view;
  };

  var attributeTypeSet = "set";
  var attributeTypeHash = "hash";
  var attributeTypeBoolean = "boolean";
  var attributeTypeDefault = "string";
  var attributeTypes = {
    "class": attributeTypeSet,
    style: attributeTypeHash,
    selected: attributeTypeBoolean,
    checked: attributeTypeBoolean,
    disabled: attributeTypeBoolean,
    readonly: attributeTypeBoolean,
    multiple: attributeTypeBoolean
  };
  var attributeClasses = {};
  attributeClasses[attributeTypeSet] = _default$3;
  attributeClasses[attributeTypeHash] = _default$4;
  attributeClasses[attributeTypeBoolean] = _default$5;
  attributeClasses[attributeTypeDefault] = _default$6;

  var _default$7 =
  /*#__PURE__*/
  function () {
    function _default(view) {
      _classCallCheck(this, _default);

      this.view = view;
    }

    _createClass(_default, [{
      key: "get",
      value: function get(attribute) {
        var type = attributeTypes[attribute] || attributeTypeDefault;
        return new attributeClasses[type](attribute, this.view);
      }
    }, {
      key: "set",
      value: function set(attribute, value) {
        var attributeType = attributeTypes[attribute];

        if (attributeType === attributeTypeHash) {
          this.get(attribute).replace(value);
        } else if (attributeType === attributeTypeSet) {
          this.view.node.setAttribute(attribute, value.join(" "));
        } else if (attributeType === attributeTypeBoolean) {
          if (value) {
            this.view.node.setAttribute(attribute, attribute);
          } else {
            this.view.node.removeAttribute(attribute);
          }
        } else {
          this.view.node.setAttribute(attribute, value);
        }
      }
    }]);

    return _default;
  }();

  var _default$8 =
  /*#__PURE__*/
  function () {
    function _default(attributes) {
      _classCallCheck(this, _default);

      this.attributes = attributes;
    }

    _createClass(_default, [{
      key: "set",
      value: function set(part, value) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.attributes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var attribute = _step.value;
            attribute.set(part, value);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: "add",
      value: function add(value) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.attributes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var attribute = _step2.value;
            attribute.add(value);
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }, {
      key: "delete",
      value: function _delete(part) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.attributes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var attribute = _step3.value;
            attribute["delete"](part);
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
    }, {
      key: "clear",
      value: function clear() {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.attributes[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var attribute = _step4.value;
            attribute.clear();
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    }]);

    return _default;
  }();

  var _default$9 =
  /*#__PURE__*/
  function () {
    function _default(viewSet) {
      _classCallCheck(this, _default);

      this.viewSet = viewSet;
    }

    _createClass(_default, [{
      key: "get",
      value: function get(attribute) {
        return new _default$8(this.viewSet.views.map(function (view) {
          return view.attributes().get(attribute);
        }));
      }
    }, {
      key: "set",
      value: function set(attribute, value) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.viewSet.views[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var view = _step.value;
            view.attributes().set(attribute, value);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }]);

    return _default;
  }();

  var _default$a =
  /*#__PURE__*/
  function () {
    function _default(views, templates) {
      _classCallCheck(this, _default);

      this.views = views;
      this.templates = templates;
    }

    _createClass(_default, [{
      key: "find",
      value: function find(names, options) {
        if (!Array.isArray(names)) {
          names = [names];
        }

        var views = [],
            templates = [];
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.views[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var view = _step.value;
            var found = view.find(names, options);
            views = views.concat(found.views);

            if (!templates) {
              templates = views.templates();
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.templates[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var template = _step2.value;
            templates = templates.concat(template.templates().filter(function (view) {
              var _iteratorNormalCompletion3 = true;
              var _didIteratorError3 = false;
              var _iteratorError3 = undefined;

              try {
                for (var _iterator3 = names[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                  var name = _step3.value;

                  if (view.match("binding", name)) {
                    return true;
                  }
                }
              } catch (err) {
                _didIteratorError3 = true;
                _iteratorError3 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                    _iterator3["return"]();
                  }
                } finally {
                  if (_didIteratorError3) {
                    throw _iteratorError3;
                  }
                }
              }
            }));
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        return new this.constructor(views, templates);
      }
    }, {
      key: "endpoint",
      value: function endpoint(name) {
        var views = [];
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = this.views[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var view = _step4.value;
            var found = view.endpoint(name);

            if (found) {
              views.push(found);
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }

        return new this.constructor(views, this.templates);
      }
    }, {
      key: "endpointAction",
      value: function endpointAction() {
        var views = [];
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.views[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var view = _step5.value;
            var found = view.endpointAction();

            if (found) {
              views.push(found);
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
              _iterator5["return"]();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        return new this.constructor(views, this.templates);
      }
    }, {
      key: "component",
      value: function component(name) {
        var views = [];
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.views[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var view = _step6.value;
            var found = view.component(name);

            if (found) {
              views.push(found);
            }
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
              _iterator6["return"]();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        return new this.constructor(views, this.templates);
      }
    }, {
      key: "bind",
      value: function bind(objects) {
        if (!Array.isArray(objects)) {
          objects = [objects];
        }

        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = objects[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var object = _step7.value;
            this.ensureViewForObject(object).bind(object);
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
              _iterator7["return"]();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }

        return this;
      }
    }, {
      key: "transform",
      value: function transform(objects, callback) {
        var _this = this;

        if (!Array.isArray(objects)) {
          objects = [objects];
        }

        if (objects.length > 0) {
          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = objects[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var object = _step8.value;
              this.ensureViewForObject(object).transform(object, callback);
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                _iterator8["return"]();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            var _loop = function _loop() {
              var view = _step9.value;

              // Remove the view if it's an empty version, since we now have data.
              if (view.match("version", "empty")) {
                _this.views.splice(_this.views.indexOf(view), 1);

                view.remove();
                return "continue";
              } // Remove the view if we can't find an object with its id.


              if (!objects.find(function (object) {
                return view.match("id", object["id"]);
              })) {
                _this.views.splice(_this.views.indexOf(view), 1);

                view.remove();
              }
            };

            for (var _iterator9 = this.views[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var _ret = _loop();

              if (_ret === "continue") continue;
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                _iterator9["return"]();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }

          this.order(objects);
        } else {
          var template = this.templates.find(function (template) {
            return template.version() === "empty";
          });

          if (template) {
            var createdView = template.clone();
            template.insertionPoint.parentNode.insertBefore(createdView.node, template.insertionPoint);
          }

          var _iteratorNormalCompletion10 = true;
          var _didIteratorError10 = false;
          var _iteratorError10 = undefined;

          try {
            for (var _iterator10 = this.views[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
              var view = _step10.value;
              view.remove();
            }
          } catch (err) {
            _didIteratorError10 = true;
            _iteratorError10 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
                _iterator10["return"]();
              }
            } finally {
              if (_didIteratorError10) {
                throw _iteratorError10;
              }
            }
          }
        }

        return this;
      }
    }, {
      key: "use",
      value: function use(version) {
        var _iteratorNormalCompletion11 = true;
        var _didIteratorError11 = false;
        var _iteratorError11 = undefined;

        try {
          for (var _iterator11 = this.views[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
            var view = _step11.value;
            view.use(version);
          }
        } catch (err) {
          _didIteratorError11 = true;
          _iteratorError11 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
              _iterator11["return"]();
            }
          } finally {
            if (_didIteratorError11) {
              throw _iteratorError11;
            }
          }
        }

        this.usableVersion = version;
        return this;
      }
    }, {
      key: "attributes",
      value: function attributes() {
        return new _default$9(this);
      }
    }, {
      key: "order",
      value: function order(orderedObjects) {
        if (this.views.length == 0) {
          return;
        }

        var orderedIds = orderedObjects.map(function (object) {
          return object.id;
        }); // Make sure the first view is correct.

        var firstMatch = this.viewWithId(orderedIds[0]);

        if (!this.views[0].match("id", orderedIds[0])) {
          firstMatch.node.parentNode.insertBefore(firstMatch.node, this.views[0].node); // Update `this.views` to match.

          this.views.splice(this.views.indexOf(firstMatch), 1);
          this.views.unshift(firstMatch);
        } // Now move the others into place.


        var currentMatch = firstMatch;

        for (var i = 0; i < orderedIds.length; i++) {
          var nextMatchId = orderedIds[i];
          var nextMatch = this.viewWithId(nextMatchId);

          if (!this.views[i].match("id", nextMatchId)) {
            nextMatch.node.parentNode.insertBefore(nextMatch.node, currentMatch.node.nextSibling); // Update `this.views` to match.

            this.views.splice(this.views.indexOf(nextMatch), 1);
            this.views.splice(this.views.indexOf(currentMatch), 0, nextMatch);
          }

          currentMatch = nextMatch;
        }

        return this;
      }
    }, {
      key: "append",
      value: function append(arg) {
        this.views.forEach(function (view) {
          view.append(arg);
        });
        return this;
      }
    }, {
      key: "prepend",
      value: function prepend(arg) {
        this.views.forEach(function (view) {
          view.prepend(arg);
        });
        return this;
      }
    }, {
      key: "after",
      value: function after(arg) {
        this.views.forEach(function (view) {
          view.after(arg);
        });
        return this;
      }
    }, {
      key: "before",
      value: function before(arg) {
        this.views.forEach(function (view) {
          view.before(arg);
        });
        return this;
      }
    }, {
      key: "replace",
      value: function replace(arg) {
        this.views.forEach(function (view) {
          view.replace(arg);
        });
        return this;
      }
    }, {
      key: "remove",
      value: function remove() {
        this.views.forEach(function (view) {
          view.remove();
        });
        return this;
      }
    }, {
      key: "clear",
      value: function clear() {
        this.views.forEach(function (view) {
          view.clear();
        });
        return this;
      }
    }, {
      key: "setHtml",
      value: function setHtml(html) {
        this.views.forEach(function (view) {
          view.setHtml(html);
        });
        return this;
      }
    }, {
      key: "viewWithId",
      value: function viewWithId(id) {
        return this.views.find(function (view) {
          return view.match("id", id);
        });
      }
    }, {
      key: "viewForObject",
      value: function viewForObject(object) {
        return this.viewWithId(object.id);
      }
    }, {
      key: "viewHasAllBindings",
      value: function viewHasAllBindings(view, object) {
        var _loop2 = function _loop2(key) {
          if (key === "id") {
            return "continue";
          }

          if (!view.bindings().find(function (view) {
            return view.binding() === key || view.binding(true) === key;
          })) {
            return {
              v: false
            };
          }
        };

        for (var key in object) {
          var _ret2 = _loop2(key);

          switch (_ret2) {
            case "continue":
              continue;

            default:
              if (_typeof(_ret2) === "object") return _ret2.v;
          }
        }

        return true;
      }
    }, {
      key: "ensureViewForObject",
      value: function ensureViewForObject(object) {
        var _this2 = this;

        var view = this.viewForObject(object);

        if (!view) {
          var template = this.templates.find(function (template) {
            return template.match("version", _this2.usableVersion || "default");
          });

          if (!template) {
            template = this.templates.filter(function (template) {
              return !template.match("version", "empty");
            })[0];
          }

          var createdView = template.clone();
          createdView.node.dataset.id = String(object.id);
          createdView.versions = this.templates;

          if (this.views.length == 0) {
            template.insertionPoint.parentNode.insertBefore(createdView.node, template.insertionPoint);
          } else {
            var lastView = this.views[this.views.length - 1];
            lastView.node.parentNode.insertBefore(createdView.node, lastView.node.nextSibling);
          }

          view = new pw.View(createdView.node, this.templates);
          this.views.push(view);
        } else if (!this.viewHasAllBindings(view, object)) {
          // Replace the current view with a fresh version.
          var _template = this.templates.find(function (template) {
            return template.match("version", _this2.usableVersion || "default");
          });

          if (!_template) {
            // if we don't have a default version, use the first one
            _template = this.templates[0];
          }

          var freshView = _template.clone();

          freshView.node.dataset.id = String(object.id);
          freshView.versions = this.templates; // Copy forms from current view into the new one.
          // FIXME: There may be a better way to go about this, but right now forms aren't setup for
          // ui transformations, only initial renders. This code ensures the form sticks around.

          var _iteratorNormalCompletion12 = true;
          var _didIteratorError12 = false;
          var _iteratorError12 = undefined;

          try {
            for (var _iterator12 = view.bindingScopes()[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
              var binding = _step12.value;

              if (binding.node.tagName === "FORM") {
                var _iteratorNormalCompletion13 = true;
                var _didIteratorError13 = false;
                var _iteratorError13 = undefined;

                try {
                  for (var _iterator13 = freshView.bindingScopes(true)[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
                    var bindingTemplate = _step13.value;

                    if (bindingTemplate.node.dataset.b === binding.node.dataset.b) {
                      bindingTemplate.node.parentNode.replaceChild(binding.node, bindingTemplate.node);
                    }
                  }
                } catch (err) {
                  _didIteratorError13 = true;
                  _iteratorError13 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion13 && _iterator13["return"] != null) {
                      _iterator13["return"]();
                    }
                  } finally {
                    if (_didIteratorError13) {
                      throw _iteratorError13;
                    }
                  }
                }
              }
            }
          } catch (err) {
            _didIteratorError12 = true;
            _iteratorError12 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion12 && _iterator12["return"] != null) {
                _iterator12["return"]();
              }
            } finally {
              if (_didIteratorError12) {
                throw _iteratorError12;
              }
            }
          }

          this.views[this.views.indexOf(view)] = freshView;
          view.node.parentNode.replaceChild(freshView.node, view.node);
          view = freshView;
        }

        return view;
      }
    }]);

    return _default;
  }();

  var _default$b =
  /*#__PURE__*/
  function () {
    function _default(node) {
      var versions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

      _classCallCheck(this, _default);

      this.node = node;
      this.versions = versions;
    }

    _createClass(_default, [{
      key: "id",
      value: function id() {
        return this.node.dataset.id;
      }
    }, {
      key: "binding",
      value: function binding() {
        var prop = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        if (prop) {
          return this.node.dataset.b.split(".").pop();
        } else {
          return this.node.dataset.b;
        }
      }
    }, {
      key: "version",
      value: function version() {
        return this.node.dataset.v || "default";
      }
    }, {
      key: "channel",
      value: function channel() {
        return this.node.dataset.c;
      }
    }, {
      key: "match",
      value: function match(property, value) {
        var propertyValue = this[property]() || "";

        if (property === "binding") {
          value = String(value);
          return propertyValue === value || propertyValue.startsWith(value + ".");
        } else {
          value = String(value);
          return propertyValue === value;
        }

        return String(value) === this[property]() || "";
      }
    }, {
      key: "attributes",
      value: function attributes() {
        return new _default$7(this);
      }
    }, {
      key: "find",
      value: function find(names, options) {
        if (!Array.isArray(names)) {
          names = [names];
        }

        names = names.slice(0);
        var currentName = names.shift();
        var templates = this.templates().filter(function (view) {
          return view.match("binding", currentName);
        });
        var found = this.bindingScopes().concat(this.bindingProps()).filter(function (view) {
          return view.node.tagName !== "FORM";
        }).map(function (view) {
          view.versions = templates;
          return view;
        }).filter(function (view) {
          return view.match("binding", currentName);
        });

        if (options) {
          if (options.id) {
            found = found.filter(function (view) {
              return view.match("id", options.id);
            });
          }
        }

        if (found.length > 0 || templates.length > 0) {
          var set = new _default$a(found, templates);

          if (names.length == 0) {
            return set;
          } else {
            return set.find(names);
          }
        }
      }
    }, {
      key: "endpoint",
      value: function endpoint(name) {
        if (this.node.hasAttribute("data-e")) {
          return this;
        } else {
          if (name) {
            return this.query("[data-e='".concat(name, "']"))[0];
          } else {
            return this.query("[data-e]")[0];
          }
        }
      }
    }, {
      key: "endpointAction",
      value: function endpointAction() {
        var endpointView = this.endpoint();

        if (endpointView) {
          return endpointView.query("[data-e-a]")[0] || endpointView;
        } else {
          return endpointView;
        }
      }
    }, {
      key: "component",
      value: function component(name) {
        if (this.node.dataset.ui === name) {
          return this;
        } else {
          if (name) {
            return this.query("[data-ui='".concat(name, "']"))[0];
          } else {
            return this.query("[data-ui]")[0];
          }
        }
      }
    }, {
      key: "bind",
      value: function bind(object) {
        if (!object) {
          return;
        } // Insert binding props that aren't present in the view.


        this.ensureBindingPropsForObject(object);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.bindingProps()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var view = _step.value;
            var value = object[view.binding(true)];

            if (_typeof(value) === "object") {
              for (var key in value) {
                var partValue = value[key];

                if (key === "content") {
                  if (view.node.innerHTML !== partValue) {
                    view.node.innerHTML = partValue;
                  }
                } else {
                  new pw.View(view.node).attributes().set(key, partValue);
                }
              }
            } else if (typeof value === "undefined") {
              view.remove();
            } else {
              if (view.node.innerHTML !== value) {
                view.node.innerHTML = value;
              }
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.node.dataset.id = object.id;
        return this;
      }
    }, {
      key: "transform",
      value: function transform(object, callback) {
        if (!object || Array.isArray(object) && object.length == 0 || Object.getOwnPropertyNames(object).length == 0) {
          this.remove();
        } else {
          // Insert binding props that aren't present in the view.
          this.ensureBindingPropsForObject(object); // Remove binding props that aren't in the object.

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = this.bindingProps()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var view = _step2.value;

              if (!object[view.binding(true)]) {
                new pw.View(view.node).remove();
              }
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }

        if (callback) {
          callback(this, object);
        }

        return this;
      }
    }, {
      key: "use",
      value: function use(version) {
        if (!this.match("version", version)) {
          var templateWithVersion = this.versions.find(function (view) {
            return view.match("version", version);
          });

          if (templateWithVersion) {
            var viewWithVersion = templateWithVersion.clone();
            this.node.parentNode.replaceChild(viewWithVersion.node, this.node);
            this.node = viewWithVersion.node;
          }
        }

        return this;
      }
    }, {
      key: "append",
      value: function append(arg) {
        this.node.appendChild(this.ensureElement(arg));
        return this;
      }
    }, {
      key: "prepend",
      value: function prepend(arg) {
        this.node.insertBefore(this.ensureElement(arg), this.node.firstChild);
        return this;
      }
    }, {
      key: "after",
      value: function after(arg) {
        this.node.parentNode.insertBefore(this.ensureElement(arg), this.node.nextSibling);
        return this;
      }
    }, {
      key: "before",
      value: function before(arg) {
        this.node.parentNode.insertBefore(this.ensureElement(arg), this.node);
        return this;
      }
    }, {
      key: "replace",
      value: function replace(arg) {
        this.node.parentNode.replaceChild(this.ensureElement(arg), this.node);
        return this;
      }
    }, {
      key: "remove",
      value: function remove() {
        if (this.node.parentNode) {
          this.node.parentNode.removeChild(this.node);
        }

        return this;
      }
    }, {
      key: "clear",
      value: function clear() {
        while (this.node.firstChild) {
          this.node.removeChild(this.node.firstChild);
        }

        return this;
      }
    }, {
      key: "setTitle",
      value: function setTitle(value) {
        var titleView = this.query("title")[0];

        if (titleView) {
          titleView.node.innerHTML = value;
        }
      }
    }, {
      key: "setHtml",
      value: function setHtml(value) {
        this.node.innerHTML = value;
      }
    }, {
      key: "query",
      value: function query(selector) {
        var results = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this.node.querySelectorAll(selector)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var node = _step3.value;
            results.push(new this.constructor(node));
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
              _iterator3["return"]();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        return results;
      }
    }, {
      key: "bindings",
      value: function bindings() {
        return this.bindingScopes().concat(this.bindingProps());
      }
    }, {
      key: "bindingScopes",
      value: function bindingScopes() {
        var templates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var bindings = [];
        this.breadthFirst(this.node, function (childNode, halt) {
          if (childNode == this.node) {
            return; // we only care about the children
          }

          if (childNode.dataset.b) {
            var childView = new pw.View(childNode);

            if (childNode.tagName === "SCRIPT" && !childNode.dataset.p || childView.bindingProps().length > 0 || new pw.View(childNode).match("version", "empty")) {
              // Don't descend into nested scopes.
              if (!bindings.find(function (binding) {
                return binding.node.contains(childNode);
              })) {
                bindings.push(childView);
              }
            }
          }
        });

        if (templates) {
          return bindings.filter(function (binding) {
            return binding.node.tagName === "SCRIPT";
          });
        } else {
          return bindings.filter(function (binding) {
            return binding.node.tagName !== "SCRIPT";
          });
        }

        return bindings;
      }
    }, {
      key: "bindingProps",
      value: function bindingProps() {
        var templates = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var bindings = [];
        this.breadthFirst(this.node, function (childNode, halt) {
          if (childNode === this.node && !String(childNode.dataset.b).includes(".")) {
            return; // we only care about the children
          }

          if (childNode.dataset.b) {
            if (childNode.dataset.b.includes(".") || new pw.View(childNode).bindingProps().length === 0 && !new pw.View(childNode).match("version", "empty")) {
              bindings.push(new pw.View(childNode));
            } else {
              halt(); // we're done here
            }
          }
        });

        if (templates) {
          return bindings.filter(function (binding) {
            return binding.node.tagName === "SCRIPT";
          });
        } else {
          return bindings.filter(function (binding) {
            return binding.node.tagName !== "SCRIPT";
          });
        }
      }
    }, {
      key: "templates",
      value: function templates() {
        var _this = this;

        var templates = this.bindingScopes(true).concat(this.bindingProps(true)).map(function (templateView) {
          // FIXME: I think it would make things more clear to create a dedicated template object
          // we could initialize with an insertion point, then have a `clone` method there rather than on view
          var view = new pw.View(_this.ensureElement(templateView.node.innerHTML));
          view.insertionPoint = templateView.node; // Replace binding scopes with templates.

          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = view.bindingScopes()[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var binding = _step4.value;
              var template = document.createElement("script");
              template.setAttribute("type", "text/template");
              template.dataset.b = binding.binding();
              template.dataset.v = binding.version();
              template.innerHTML = binding.node.outerHTML.trim();
              binding.node.parentNode.replaceChild(template, binding.node);
            } // Replace binding props with templates.

          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = view.bindingProps()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var _binding = _step5.value;

              var _template = document.createElement("script");

              _template.setAttribute("type", "text/template");

              _template.dataset.b = _binding.binding();
              _template.dataset.v = _binding.version(); // Prevents this template from being returned by `bindingScopes`.

              _template.dataset.p = true;
              _template.innerHTML = _binding.node.outerHTML.trim();

              _binding.node.parentNode.replaceChild(_template, _binding.node);
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                _iterator5["return"]();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }

          return view;
        });

        if (this.id()) {
          // We're looking for prop templates for a node that might have been rendered
          // on the server; try to find the prop templates that exist in the view.
          var sibling = new pw.View(this.node.parentNode).templates().find(function (template) {
            return template.match("binding", _this.binding()) && template.match("version", _this.version());
          });

          if (sibling) {
            templates = templates.concat(sibling.templates());
          }
        }

        return templates;
      }
    }, {
      key: "breadthFirst",
      value: function breadthFirst(node, cb) {
        var queue = [node];

        while (queue.length > 0) {
          var halted = false;

          var halt = function halt() {
            halted = true;
          };

          var subNode = queue.shift();
          if (!subNode) continue;

          if (_typeof(subNode) == "object" && "nodeType" in subNode && subNode.nodeType === 1 && subNode.cloneNode) {
            cb.call(this, subNode, halt);
          }

          if (!halted) {
            var children = subNode.childNodes;

            if (children) {
              for (var i = 0; i < children.length; i++) {
                if (children[i].tagName) {
                  queue.push(children[i]);
                }
              }
            }
          }
        }
      }
    }, {
      key: "clone",
      value: function clone() {
        return new pw.View(this.node.cloneNode(true));
      }
    }, {
      key: "ensureElement",
      value: function ensureElement(arg) {
        if (arg instanceof Element) {
          return arg;
        } else {
          var container = document.createElement("div");
          container.innerHTML = arg.trim();
          return container.firstChild;
        }
      }
    }, {
      key: "ensureBindingPropsForObject",
      value: function ensureBindingPropsForObject(object) {
        var _this2 = this;

        var _loop = function _loop(key) {
          // Skip nested data structures.
          if (object[key].constructor === Array) {
            return "continue";
          }

          if (!_this2.bindingProps().find(function (binding) {
            return binding.match("binding", key);
          })) {
            var template = _this2.templates().find(function (template) {
              return template.match("binding", key);
            });

            if (template) {
              var createdView = template.clone();
              template.insertionPoint.parentNode.insertBefore(createdView.node, template.insertionPoint);
            }
          }
        };

        for (var key in object) {
          var _ret = _loop(key);

          if (_ret === "continue") continue;
        }
      }
    }]);

    return _default;
  }();

  var broadcasts = {};
  var components = {};
  var instances = [];
  var states = {};
  var observer;

  var _default$c =
  /*#__PURE__*/
  function () {
    function _default() {
      _classCallCheck(this, _default);
    }

    _createClass(_default, null, [{
      key: "register",
      value: function register(name, component) {
        components[name] = component;
      }
    }, {
      key: "init",
      value: function init(node) {
        var _this = this;

        if (!observer) {
          observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              if (mutation.addedNodes) {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                  for (var _iterator = mutation.addedNodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var _node = _step.value;

                    _this.componentsForView(new pw.View(_node)).forEach(function (view) {
                      _this.componentFromView(view);
                    });
                  }
                } catch (err) {
                  _didIteratorError = true;
                  _iteratorError = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion && _iterator["return"] != null) {
                      _iterator["return"]();
                    }
                  } finally {
                    if (_didIteratorError) {
                      throw _iteratorError;
                    }
                  }
                }
              }

              if (mutation.removedNodes) {
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                  for (var _iterator2 = mutation.removedNodes[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var _node2 = _step2.value;

                    _this.componentsForView(new pw.View(_node2)).forEach(function (view) {
                      var component = instances.find(function (component) {
                        return component.view.node === view.node;
                      });

                      if (component) {
                        component.channels.slice(0).forEach(function (channel) {
                          component.ignore(channel);
                        });
                        instances.splice(instances.indexOf(component), 1);
                        component.disappear();
                      }
                    });
                  }
                } catch (err) {
                  _didIteratorError2 = true;
                  _iteratorError2 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                      _iterator2["return"]();
                    }
                  } finally {
                    if (_didIteratorError2) {
                      throw _iteratorError2;
                    }
                  }
                }
              }
            });
          });
          observer.observe(document.documentElement, {
            attributes: true,
            childList: true,
            subtree: true
          });
        }

        this.componentsForView(new pw.View(node)).forEach(function (view) {
          _this.componentFromView(view);
        });
      }
    }, {
      key: "componentsForView",
      value: function componentsForView(view) {
        var components = [];

        if (view.node.tagName) {
          if (view.node.dataset.ui) {
            components.push(view);
          }

          components = components.concat(view.query("[data-ui]"));
        }

        return components;
      }
    }, {
      key: "componentFromView",
      value: function componentFromView(view) {
        var serializedState = window.localStorage.getItem("pw:component-state:".concat(window.location.pathname));

        if (serializedState) {
          states = this.parseState(serializedState);
        } else {
          states = {};
        }

        if (!instances.find(function (component) {
          return component.view.node === view.node;
        })) {
          var uiComponents = this.parseUI(view.node.dataset.ui);
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = uiComponents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var uiComponent = _step3.value;

              try {
                if (uiComponent.config.debug) {
                  console.debug("[component] `".concat(uiComponent.name, "': initializing"));
                }

                var object = components[uiComponent.name] || this.create();
                var instance = new object(view, Object.assign({
                  name: uiComponent.name
                }, uiComponent.config));
                instances.push(instance);
                var matcher = uiComponent.name;

                if (instance.config.id) {
                  matcher = "".concat(matcher, ".").concat(instance.config.id);
                }

                if (states[matcher]) {
                  instance.state = states[matcher];
                } else {
                  instance.state = instance.config.state || "initial";
                }

                if (instance.state !== "initial") {
                  instance.transition(instance.state);
                }

                instance.appear();

                if (instance.config.debug) {
                  console.debug("[component] `".concat(uiComponent.name, "': initialized"));
                }
              } catch (error) {
                console.error("failed to initialize component `".concat(uiComponent.name, "': ").concat(error));
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                _iterator3["return"]();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }
        }
      }
    }, {
      key: "broadcast",
      value: function broadcast(channel, payload) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = (broadcasts[channel] || [])[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var tuple = _step4.value;
            tuple[0].trigger(channel, payload);
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
              _iterator4["return"]();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
    }, {
      key: "parseUI",
      value: function parseUI(uiString) {
        var _this2 = this;

        return uiString.split(";").reduce(function (config, ui) {
          var splitUi = ui.split("(");
          var uiName = splitUi[0].trim();
          var uiConfig = {};

          if (splitUi[1]) {
            var configString = splitUi[1].trim();
            configString = configString.substring(0, configString.length - 1);
            uiConfig = _this2.parseConfig(configString);
          }

          config.push({
            name: uiName,
            config: uiConfig
          });
          return config;
        }, []);
      }
    }, {
      key: "parseConfig",
      value: function parseConfig(configString) {
        if (typeof configString === "undefined") {
          return {};
        }

        return configString.split(",").reduce(function (config, option) {
          var splitOption = option.trim().split(":");
          var key = splitOption.shift().trim();
          var value;

          if (splitOption.length === 0) {
            value = true;
          } else {
            value = splitOption.join(":").trim();
          }

          config[key] = value;
          return config;
        }, {});
      }
    }, {
      key: "parseState",
      value: function parseState(stateString) {
        if (typeof stateString === "undefined" || stateString === "") {
          return {};
        }

        return stateString.trim().split(";").reduce(function (state, componentState) {
          var componentStateArr = componentState.trim().split(":");
          state[componentStateArr[0].trim()] = componentStateArr[1].trim();
          return state;
        }, {});
      }
    }, {
      key: "clearObserver",
      value: function clearObserver() {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      }
    }, {
      key: "create",
      value: function create() {
        var defaultConstructor = function defaultConstructor(view) {
          var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          this.view = view;
          this.node = view.node;
          this.config = config;
          this.channels = [];
          this.transitions = {
            enter: [],
            leave: []
          };

          if (this.constructor && this.constructor !== defaultConstructor) {
            this.constructor();
          }
        };

        var component = defaultConstructor;

        component.prototype.appear = function () {// intentionally empty
        };

        component.prototype.disappear = function () {// intentionally empty
        };

        component.prototype.listen = function (channel, callback) {
          var _this3 = this;

          if (this.config.debug) {
            console.debug("[component] ".concat(this.config.name, " listening for events on `").concat(channel, "'"));
          }

          this.node.addEventListener(channel, function (evt) {
            callback.call(_this3, evt.detail);
          });

          if (!broadcasts[channel]) {
            broadcasts[channel] = [];
          }

          broadcasts[channel].push([this, callback]);
          this.channels.push(channel);
        };

        component.prototype.ignore = function (channel) {
          var _this4 = this;

          if (this.config.debug) {
            console.debug("[component] ".concat(this.config.name, " ignoring events on `").concat(channel, "'"));
          }

          broadcasts[channel].filter(function (tuple) {
            return tuple[0].view.node === _this4.view.node;
          }).forEach(function (tuple) {
            _this4.view.node.removeEventListener(channel, tuple[1]);

            broadcasts[channel].splice(broadcasts[channel].indexOf(tuple), 1);
          });
          this.channels.splice(this.channels.indexOf(channel), 1);
        };

        component.prototype.trigger = function (channel, payload) {
          if (this.config.debug) {
            console.debug("[component] ".concat(this.config.name, " triggering `").concat(channel, "': ").concat(JSON.stringify(payload)));
          }

          this.view.node.dispatchEvent(new CustomEvent(channel, {
            detail: payload
          }));
        };

        component.prototype.bubble = function (channel, payload) {
          if (this.config.debug) {
            console.debug("[component] ".concat(this.config.name, " bubbling `").concat(channel, "': ").concat(JSON.stringify(payload)));
          }

          this.view.node.dispatchEvent(new CustomEvent(channel, {
            bubbles: true,
            detail: payload
          }));
        };

        component.prototype.trickle = function (channel, payload) {
          this.trigger(channel, payload);

          if (broadcasts[channel]) {
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              var _loop = function _loop() {
                var view = _step5.value;
                var tuple = broadcasts[channel].find(function (tuple) {
                  return tuple[0].view.node === view.node;
                });

                if (tuple) {
                  tuple[0].trigger(channel, payload);
                }
              };

              for (var _iterator5 = this.view.query("*[data-ui]")[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                _loop();
              }
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                  _iterator5["return"]();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
                }
              }
            }
          }
        };

        component.prototype.transition = function (state, payload) {
          var _this5 = this;

          var enterTransitions = this.transitions.enter.filter(function (transition) {
            return transition.state === state;
          });
          var leaveTransitions = this.transitions.leave.filter(function (transition) {
            return transition.state === _this5.state;
          });
          var generalEnterTransitions = this.transitions.enter.filter(function (transition) {
            return typeof transition.state === "undefined";
          });
          var generalLeaveTransitions = this.transitions.leave.filter(function (transition) {
            return typeof transition.state === "undefined";
          });
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = leaveTransitions[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var transition = _step6.value;
              transition.callback(payload);
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          var _iteratorNormalCompletion7 = true;
          var _didIteratorError7 = false;
          var _iteratorError7 = undefined;

          try {
            for (var _iterator7 = generalLeaveTransitions[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
              var _transition = _step7.value;

              _transition.callback(this.state, payload);
            }
          } catch (err) {
            _didIteratorError7 = true;
            _iteratorError7 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
                _iterator7["return"]();
              }
            } finally {
              if (_didIteratorError7) {
                throw _iteratorError7;
              }
            }
          }

          this.trickle("".concat(this.config.name, ":leave:").concat(this.state), payload);
          this.node.classList.remove("ui-state-".concat(this.state));
          this.state = state;
          this.node.classList.add("ui-state-".concat(this.state));
          var referenceName = this.config.name;

          if (this.config.id) {
            referenceName = "".concat(referenceName, ".").concat(this.config.id);
          }

          var update = {};
          update[referenceName] = this.state;
          Object.assign(states, update);
          var values = [];

          for (var key in states) {
            values.push("".concat(key, ":").concat(states[key]));
          }

          if (this.config.sticky) {
            window.localStorage.setItem("pw:component-state:".concat(window.location.pathname), values.join(";"));
          }

          var _iteratorNormalCompletion8 = true;
          var _didIteratorError8 = false;
          var _iteratorError8 = undefined;

          try {
            for (var _iterator8 = enterTransitions[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
              var _transition2 = _step8.value;

              _transition2.callback(payload);
            }
          } catch (err) {
            _didIteratorError8 = true;
            _iteratorError8 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                _iterator8["return"]();
              }
            } finally {
              if (_didIteratorError8) {
                throw _iteratorError8;
              }
            }
          }

          var _iteratorNormalCompletion9 = true;
          var _didIteratorError9 = false;
          var _iteratorError9 = undefined;

          try {
            for (var _iterator9 = generalEnterTransitions[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
              var _transition3 = _step9.value;

              _transition3.callback(this.state, payload);
            }
          } catch (err) {
            _didIteratorError9 = true;
            _iteratorError9 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                _iterator9["return"]();
              }
            } finally {
              if (_didIteratorError9) {
                throw _iteratorError9;
              }
            }
          }

          this.trickle("".concat(this.config.name, ":enter:").concat(this.state), payload);
        };

        component.prototype.enter = function (state, callback) {
          var object;

          if (typeof callback === "undefined") {
            object = {
              callback: state
            };
          } else {
            object = {
              state: state,
              callback: callback
            };
          }

          this.transitions.enter.push(object);
        };

        component.prototype.leave = function (state, callback) {
          var object;

          if (typeof callback === "undefined") {
            object = {
              callback: state
            };
          } else {
            object = {
              state: state,
              callback: callback
            };
          }

          this.transitions.leave.push(object);
        };

        return component;
      }
    }, {
      key: "components",
      get: function get() {
        return components;
      }
    }, {
      key: "instances",
      get: function get() {
        return instances;
      }
    }]);

    return _default;
  }();



  var pw$1 = /*#__PURE__*/Object.freeze({
    broadcast: broadcast,
    define: define,
    logger: _default,
    ready: ready,
    send: send,
    server: _default$1,
    ui: _default$2,
    version: version,
    wake: wake,
    View: _default$b,
    Component: _default$c
  });

  var _default$d =
  /*#__PURE__*/
  function () {
    function _default(transformation) {
      _classCallCheck(this, _default);

      this.id = transformation.id;
      this.process(transformation.calls);
    }

    _createClass(_default, [{
      key: "process",
      value: function process(calls) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = document.querySelectorAll("*[data-t='" + this.id + "']")[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var node = _step.value;
            this.transform(calls, new pw.View(node));
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: "transform",
      value: function transform(calls, transformable) {
        var _this = this;

        if (!transformable) {
          return;
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          var _loop = function _loop() {
            var transformation = _step2.value;

            try {
              var methodName = transformation[0];
              var method = transformable[methodName];

              if (method) {
                var args = transformation[1];

                if (transformation[2].length > 0) {
                  var i = 0;
                  args.push(function (view, object) {
                    _this.transform(transformation[2][i], view);

                    i++;
                  });
                }

                _this.transform(transformation[3], method.apply(transformable, args));
              } else {
                console.warn("unknown view method: ".concat(methodName), transformable);
              }
            } catch (error) {
              console.error("error transforming", error, transformable, transformation, calls);
            }
          };

          for (var _iterator2 = calls[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            _loop();
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }]);

    return _default;
  }();

  ready(function () {
    _default.install();
    var pwGlobal = new (_default$c.create())(new _default$b(document), {});
    pwGlobal.listen("pw:socket:connected", function (socket) {
      if (socket.config.global) {
        _default$1.reachable = true;
        _default$1.socket = socket;
        _default.flush();
      }
    });
    pwGlobal.listen("pw:socket:disconnected", function (socket) {
      if (socket.config.global) {
        _default$1.reachable = false;
        _default$1.socket = null;
      }
    });
    pwGlobal.listen("pw:socket:disappeared", function (socket) {
      if (socket.config.global) {
        _default$1.reachable = false;
      }
    });
    pwGlobal.listen("pw:socket:message:transformation", function (message) {
      new _default$d(message);
    });
    _default$c.init(document.querySelector("html"));
  });

  return pw$1;

}));
