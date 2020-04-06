pw.define("form", {
  constructor: function constructor() {
    var _this = this;

    this.$fields = this.view.query("input, textarea, button, select");
    this.$focused; // Set the element currently in focus to be refocused later.
    //

    this.enter("submitting", function () {
      $focused = document.querySelector(":focus");
    }); // Set all fields as disabled.
    //

    this.enter("submitting", function () {
      _this.disable();
    }); // Reenable all fields when the form errors.
    //

    this.enter("failed", function () {
      _this.reenable();
    }); // Refocus on the element that was in focus before form was submitted.
    //

    this.enter("failed", function () {
      if (_this.$focused) {
        _this.$focused.focus();

        _this.$focused = null;
      }
    });
    this.node.addEventListener("submit", function (event) {
      if (pw.ui.modifierKeyPressed) {
        return;
      }

      if (pw.server.reachable) {
        event.preventDefault();
        event.stopImmediatePropagation();
        var formData = new FormData(_this.node);

        _this.transition("submitting"); // Submit the form in the background.
        //


        pw.send(_this.node.action, {
          method: _this.node.method,
          data: formData,
          success: function success(xhr) {
            _this.transition("succeeded", xhr);

            if (typeof _this.config.handle_success === "undefined" || _this.config.handle_success === "true") {
              if (!pw.ui.visit(xhr.responseURL, xhr)) {
                _this.node.reset();

                _this.reenable();
              }
            }
          },
          error: function error(xhr) {
            _this.transition("failed", xhr);
          }
        });

        _this.transition("submitted");
      }
    });
  },
  disable: function disable() {
    this.$fields.forEach(function (view) {
      view.node.disabled = true;
    });
  },
  reenable: function reenable() {
    this.$fields.forEach(function (view) {
      view.node.disabled = false;
    });
  }
});
