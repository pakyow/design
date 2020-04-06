pw.define("socket", {
  constructor: function constructor() {
    this.reconnectTimeout = this.currentReconnectTimeout = 500;
    this.reconnectDecay = 1.25;
    this.reconnecting = false;
    this.heartbeat = 30000;
    this.connect();
  },
  disappear: function disappear() {
    pw.broadcast("pw:socket:disappeared", this);
    clearInterval(this.beatInterval);
    this.connection.onclose = null;
    this.connection.close();
    this.connected = false;
  },
  connect: function connect() {
    var _this = this;

    if (!this.config.endpoint) {
      return;
    }

    this.connection = new WebSocket(this.config.endpoint);

    this.connection.onopen = function () {
      pw.broadcast("pw:socket:connected", _this);
      _this.currentReconnectTimeout = _this.reconnectTimeout;
      _this.connected = true;
    };

    this.connection.onclose = function () {
      if (_this.connected) {
        pw.broadcast("pw:socket:closed", _this);
        _this.connected = false;
      }

      _this.reconnect();
    };

    this.connection.onmessage = function (event) {
      var payload = JSON.parse(event.data).payload;

      if (payload.channel === "system") {
        pw.ui.info = payload.message;
      } else {
        pw.broadcast("pw:socket:message:" + payload.channel, payload.message);
      }
    };

    if (!this.reconnecting) {
      this.beatInterval = setInterval(function () {
        _this.beat();
      }, this.heartbeat);
      pw.wake(function () {
        _this.beat();
      });
    }
  },
  reconnect: function reconnect() {
    var _this2 = this;

    this.reconnecting = true;
    setTimeout(function () {
      _this2.currentReconnectTimeout *= _this2.reconnectDecay;

      _this2.connect();
    }, this.currentReconnectTimeout);
  },
  beat: function beat() {
    this.send("beat");
  },
  send: function send(payload) {
    var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "unknown";
    this.connection.send(JSON.stringify({
      type: type,
      payload: payload
    }));
  }
});
