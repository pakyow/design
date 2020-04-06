pw.define("submittable", {
  constructor: function constructor() {
    var _this = this;

    this.node.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      _this.node.closest("form").submit();
    });
  }
});
