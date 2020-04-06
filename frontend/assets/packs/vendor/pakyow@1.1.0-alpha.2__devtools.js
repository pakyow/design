pw.define("devtools", {
  constructor: function constructor() {
    var _this = this;

    if (this.config.environment === "development") {
      window.localStorage.setItem("pw:devtools-view-path-mapping:".concat(this.config.viewPath), window.location.href);
    }

    this.listen("devtools:toggle-environment", function () {
      pw.send("/pw-restart?environment=" + _this.switchToEnvironment(), {
        method: "post",
        success: function success() {
          _this.transition("restarting");
        },
        error: function error() {
          console.error("[devtools] could not restart");
        }
      });
    });
    this.listen("pw:socket:connected", function () {
      if (_this.state === "restarting") {
        if (_this.switchToEnvironment() === "prototype") {
          document.location.assign(_this.config.viewPath);
        } else {
          document.location.assign(window.localStorage.getItem("pw:devtools-view-path-mapping:".concat(_this.config.viewPath)));
        }
      }
    });
  },
  switchToEnvironment: function switchToEnvironment() {
    if (this.config.environment === "development") {
      return "prototype";
    } else {
      return "development";
    }
  }
});
pw.define("devtools:environment", {
  constructor: function constructor() {
    var _this2 = this;

    this.node.addEventListener("click", function (event) {
      _this2.bubble("devtools:toggle-environment");
    });
  }
});
pw.define("devtools:mode-selector", {
  constructor: function constructor() {
    var _this3 = this;

    this.node.addEventListener("change", function () {
      document.location.assign(window.location.pathname + '?modes[]=' + _this3.node.value);
    });
  }
});
pw.define("devtools:reloader", {
  constructor: function constructor() {
    this.listen("pw:ui:stale", function () {
      document.location.reload();
    });
  }
});
