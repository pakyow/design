pw.define("confirmable", {
  constructor: function constructor() {
    var _this = this;

    this.message = this.config.message || "Are you sure?";

    if (this.node.tagName === "FORM") {
      this.node.addEventListener("submit", function (event) {
        _this.callback(event);
      });
    } else {
      this.node.addEventListener("click", function (event) {
        _this.callback(event);
      });
    }
  },
  callback: function callback(event) {
    if (confirm(this.message)) ; else {
      event.preventDefault();
      event.stopImmediatePropagation();
      return false;
    }
  }
});
