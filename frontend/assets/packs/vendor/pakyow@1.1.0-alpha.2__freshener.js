pw.define("freshener", {
  constructor: function constructor() {
    var _this = this;

    this.listen("pw:ui:stale", function () {
      _this.transition("stale");
    });
  }
});
