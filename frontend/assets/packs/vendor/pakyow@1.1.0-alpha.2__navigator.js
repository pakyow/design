pw.define("navigator", {
  constructor: function constructor() {
    var _this = this;

    this.headDetails = this.buildHeadDetails(document.head);

    if (window.location.hash) {
      this.scrollToHash(window.location.hash);
    }

    this.initialState = window.history.state || {
      url: document.location.href,
      scrollX: window.pageXOffset,
      scrollY: window.pageYOffset
    };

    if ("scrollRestoration" in window.history) {
      history.scrollRestoration = "manual";
    }

    window.history.replaceState(this.initialState, "", window.location.href);
    window.scrollTo(this.initialState.scrollX, this.initialState.scrollY);

    window.onbeforeunload = function (event) {
      var unloadState = window.history.state;
      unloadState.scrollX = window.pageXOffset;
      unloadState.scrollY = window.pageYOffset;
      window.history.replaceState(unloadState, "", window.location.href);
    };

    window.onpopstate = function (event) {
      if (event.state) {
        _this.load(event.state);
      }
    };

    document.documentElement.addEventListener("click", function (event) {
      if (pw.ui.modifierKeyPressed) {
        return;
      }

      var link = event.target.closest("a");

      if (link && link.target !== "_blank") {
        event.preventDefault();

        _this.visit(link.href);
      }
    });
    pw.ui.navigableVia(this);
  },
  visit: function visit(url, xhr) {
    if (window.history && this.isInternal(url)) {
      this.saveScrollPosition();
      var state = {
        url: url,
        scrollX: 0,
        scrollY: 0
      };

      if (this.isCurrent(url)) {
        if (this.isHashChange(url)) {
          window.history.replaceState(state, "", url);
          this.scrollToHash(window.location.hash);
          return;
        } else {
          return;
        }
      }

      window.history.pushState(state, "", url);

      if (xhr) {
        this.handleXHR(xhr, state);
      } else {
        this.load(state);
      }

      return true;
    } else {
      document.location = url;
    }
  },
  load: function load(state) {
    var _this2 = this;

    var xhr = pw.send(state.url, {
      complete: function complete(xhr) {
        _this2.handleXHR(xhr, state);
      },
      progress: function progress(event) {
        var value;

        if (event.total) {
          value = event.loaded / event.total;
        }

        if (value < 1) {
          pw.broadcast("navigator:progressed", {
            id: xhr.id,
            value: value
          });
        }
      }
    });
    pw.broadcast("navigator:dispatched", {
      id: xhr.id
    });
  },
  handleXHR: function handleXHR(xhr, state) {
    var _this3 = this;

    var parser = new DOMParser();
    var doc = parser.parseFromString(xhr.responseText, "text/html");
    var newHeadDetails = this.buildHeadDetails(doc.querySelector("head"));
    var loadables = []; // Add new scripts to be loaded.
    // Creating a new element is the only way to get the onload callback to fire.

    Object.keys(newHeadDetails.scripts).forEach(function (key) {
      if (!_this3.headDetails.scripts[key]) {
        var script = new pw.View(document.createElement("script"));
        script.node.setAttribute("src", newHeadDetails.scripts[key].node.src);
        newHeadDetails.scripts[key] = script;
        loadables.push(script);
      }
    }); // Add new styles to be loaded.

    Object.keys(newHeadDetails.styles).forEach(function (key) {
      if (!_this3.headDetails.styles[key]) {
        loadables.push(newHeadDetails.styles[key]);
      }
    });
    this.loadExternals(loadables, xhr, function () {
      // Insert new non-scripts/styles.
      newHeadDetails.others.forEach(function (view) {
        document.head.appendChild(view.node);
      }); // Remove current non-scripts/styles.

      _this3.headDetails.others.forEach(function (view) {
        view.remove();
      }); // Remove old scripts.


      Object.keys(_this3.headDetails.scripts).forEach(function (key) {
        if (!newHeadDetails.scripts[key]) {
          _this3.headDetails.scripts[key].remove();
        } else {
          newHeadDetails.scripts[key] = _this3.headDetails.scripts[key];
        }
      }); // Remove old styles.

      Object.keys(_this3.headDetails.styles).forEach(function (key) {
        if (!newHeadDetails.styles[key]) {
          _this3.headDetails.styles[key].remove();
        } else {
          newHeadDetails.styles[key] = _this3.headDetails.styles[key];
        }
      });
      _this3.headDetails = newHeadDetails; // Replace the current body with the one that was just requested.

      document.documentElement.replaceChild(doc.querySelector("body"), document.body); // Scroll to the correct position.

      window.scrollTo(state.scrollX, state.scrollY); // Copy html attributes.

      var $html = document.querySelector("html");
      Array.prototype.slice.call(doc.querySelector("html").attributes).forEach(function (item) {
        $html.setAttribute(item.name, item.value);
      });
      pw.broadcast("navigator:changed", {
        id: xhr.id
      });
    });
  },
  isInternal: function isInternal(url) {
    var link = document.createElement("a");
    link.href = url;
    return link.host === window.location.host && link.protocol === window.location.protocol;
  },
  isCurrent: function isCurrent(url) {
    var link = document.createElement("a");
    link.href = url;
    return this.isInternal(url) && link.pathname === window.location.pathname;
  },
  isHashChange: function isHashChange(url) {
    var link = document.createElement("a");
    link.href = url;
    return this.isInternal(url) && link.hash !== window.location.hash;
  },
  buildHeadDetails: function buildHeadDetails(head) {
    var details = {
      scripts: {},
      styles: {},
      others: []
    };
    new pw.View(head).query("*").forEach(function (view) {
      if (view.node.tagName === "SCRIPT" && view.node.src) {
        details.scripts[view.node.outerHTML] = view;
      } else if (view.node.tagName === "LINK" && view.node.rel === "stylesheet" && view.node.href) {
        details.styles[view.node.outerHTML] = view;
      } else {
        details.others.push(view);
      }
    });
    return details;
  },
  loadExternals: function loadExternals(loadables, xhr, callback) {
    if (loadables.length > 0) {
      var loading = [];
      loadables.forEach(function (view) {
        loading.push(view);

        view.node.onload = function () {
          loading.splice(loading.indexOf(view), 1);
          var total = loadables.length + 1;
          var loaded = total - loading.length;
          pw.broadcast("navigator:progressed", {
            id: xhr.id,
            value: loaded / total
          });

          if (loading.length === 0) {
            callback();
          }
        };

        document.head.appendChild(view.node);
      });
    } else {
      pw.broadcast("navigator:progressed", {
        id: xhr.id,
        value: 1
      });
      callback();
    }
  },
  saveScrollPosition: function saveScrollPosition() {
    if (window.history.state) {
      window.history.state.scrollX = window.pageXOffset;
      window.history.state.scrollY = window.pageYOffset;
      window.history.replaceState(window.history.state, "", window.history.state.url);
    } else {
      this.initialState.scrollX = window.pageXOffset;
      this.initialState.scrollY = window.pageYOffset;
    }
  },
  scrollToHash: function scrollToHash(hash) {
    var $element = document.querySelector(hash);

    if ($element) {
      var bounding = $element.getBoundingClientRect();
      window.scrollTo(0 + window.scrollX + parseInt(this.config.offsetX), bounding.top + window.scrollY + parseInt(this.config.offsetY));
    }
  }
});
pw.define("navigator:progress", {
  appear: function appear() {
    var _this4 = this;

    this.listen("navigator:dispatched", function (state) {
      if (!_this4.current) {
        _this4.current = state.id;
        _this4.node.style.width = 0.0;
        _this4.timeout = setTimeout(function () {
          _this4.show();
        }, 300);
      }
    });
    this.listen("navigator:changed", function (state) {
      if (_this4.current === state.id) {
        if (_this4.timeout) {
          clearTimeout(_this4.timeout);
          _this4.timeout = null;
        }

        _this4.current = null;

        _this4.hide();
      }
    });
    this.listen("navigator:progressed", function (state) {
      if (_this4.current === state.id) {
        _this4.node.style.width = state.value * 100 + "%";
      }
    });
  },
  show: function show() {
    this.node.classList.remove("ui-invisible");
  },
  hide: function hide() {
    this.node.classList.add("ui-invisible");
  }
});
