(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * The default MapPane to contain the element.
 * @type {string}
 * @const
 * @private
 */
var DEFAULT_PANE_NAME = 'overlayLayer';
var CSS_TRANSFORM = function () {
  var div = document.createElement('div');
  var transformProps = ['transform', 'WebkitTransform', 'MozTransform', 'OTransform', 'msTransform'];
  for (var i = 0; i < transformProps.length; i++) {
    var prop = transformProps[i];
    if (div.style[prop] !== undefined) {
      return prop;
    }
  }

  // return unprefixed version by default
  return transformProps[0];
}();

var GmapOverlay = function (_google$maps$OverlayV) {
  _inherits(GmapOverlay, _google$maps$OverlayV);

  function GmapOverlay(options) {
    _classCallCheck(this, GmapOverlay);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GmapOverlay).call(this));

    _this._isAdded = false;
    _this._paneName = DEFAULT_PANE_NAME;

    // var element = document.createElement('element');
    // element.style.position = 'absolute';
    // element.style.top = 0;
    // element.style.left = 0;
    // element.style.pointerEvents = 'none';

    /**
     * The element element.
     * @type {!HTMLCanvasElement}
     */
    _this._element = null;

    _this._cssWidth = 300;
    _this._cssHeight = 150;

    /**
     * A user-supplied function called whenever an update is required. Null or
     * undefined if a callback is not provided.
     * @type {?function=}
     * @private
     */
    _this._updateHandler = null;

    /**
     * A user-supplied function called whenever an update is required and the
     * map has been resized since the last update. Null or undefined if a
     * callback is not provided.
     * @type {?function}
     * @private
     */
    _this._resizeHandler = null;

    /**
     * The LatLng coordinate of the top left of the current view of the map. Will
     * be null when this._isAdded is false.
     * @type {google.maps.LatLng}
     * @private
     */
    _this._topLeft = null;

    /**
     * The map-pan event listener. Will be null when this._isAdded is false. Will
     * be null when this._isAdded is false.
     * @type {?function}
     * @private
     */
    _this._centerListener = null;

    /**
     * The map-resize event listener. Will be null when this._isAdded is false.
     * @type {?function}
     * @private
     */
    _this._resizeListener = null;

    /**
     * If true, the map size has changed and this._resizeHandler must be called
     * on the next update.
     * @type {boolean}
     * @private
     */
    _this._needsResize = true;

    // set provided options, if any
    if (options) _this.options = options;
    return _this;
  }

  _createClass(GmapOverlay, [{
    key: 'onAdd',
    value: function onAdd() {
      if (this._isAdded) return;

      this._isAdded = true;
      this._setPane();

      this._resizeListener = google.maps.event.addListener(this.getMap(), 'resize', this._resize.bind(this));
      this._centerListener = google.maps.event.addListener(this.getMap(), 'center_changed', this._repositionCanvas.bind(this));

      this._resize();
      this._repositionCanvas();
    }
  }, {
    key: 'onRemove',
    value: function onRemove() {
      if (!this._isAdded) return;

      this._isAdded = false;
      this._topLeft = null;

      // remove element and listeners for pan and resize from map
      this._element.parentElement.removeChild(this._element);
      if (this._centerListener) {
        google.maps.event.removeListener(this._centerListener);
        this._centerListener = null;
      }
      if (this._resizeListener) {
        google.maps.event.removeListener(this._resizeListener);
        this._resizeListener = null;
      }
    }
  }, {
    key: '_setPane',


    /**
     * Adds the element to the specified container pane. Since this is guaranteed to
     * execute only after onAdd is called, this is when paneName's existence is
     * checked (and an error is thrown if it doesn't exist).
     * @private
     */
    value: function _setPane() {
      if (!this._isAdded) return;

      // onAdd has been called, so panes can be used
      // https://developers.google.com/maps/documentation/javascript/reference?hl=ko#MapPanes
      var panes = this.getPanes();
      if (!panes[this._paneName]) {
        throw new Error('"' + this._paneName + '" is not a valid MapPane name.');
      }

      panes[this._paneName].appendChild(this._element);

      var self = this;

      var listener = function listener(e) {
        if (self._element.scene.mode() === 1) event.stopPropagation();
      };

      ['mousemove', 'dragstart', 'drag', 'dragend'].forEach(function (event) {
        google.maps.event.addDomListener(self._element, 'mousemove', listener);
      });
      // var self = this
      // google.maps.event.addDomListener(this._element, 'mousemove', function(event) {
      //   // stop click reaction on another layers
      //   event.stopPropagation();

      //   console.log('click')

      //   // add also event to 3rd parameter for catching
      //   // google.maps.event.trigger(self, 'click', event);
      // });
    }

    /**
     * Set a function that will be called whenever the parent map and the overlay's
     * element have been resized. If resizeHandler is null or unspecified, any
     * existing callback is removed.
     * @param {?function=} resizeHandler The resize callback function.
     */

  }, {
    key: 'draw',
    value: function draw() {
      this._repositionCanvas();
    }
  }, {
    key: '_resize',
    value: function _resize() {
      if (!this._isAdded) return;

      var map = this.getMap();
      var mapWidth = map.getDiv().offsetWidth;
      var mapHeight = map.getDiv().offsetHeight;

      var newWidth = mapWidth * this._resolutionScale;
      var newHeight = mapHeight * this._resolutionScale;
      var oldWidth = this._element.width;
      var oldHeight = this._element.height;

      // resizing may allocate a new back buffer, so do so conservatively
      if (oldWidth !== newWidth || oldHeight !== newHeight) {
        this._element.width = newWidth;
        this._element.height = newHeight;

        this._needsResize = true;
        // TODO 이 로직을 대체해야한다. redraw ..
        // this.scheduleUpdate();
        this._update();
      }

      // reset styling if new sizes don't match; resize of data not needed
      if (this._cssWidth !== mapWidth || this._cssHeight !== mapHeight) {
        this._cssWidth = mapWidth;
        this._cssHeight = mapHeight;
        this._element.style.width = mapWidth + 'px';
        this._element.style.height = mapHeight + 'px';
      }
    }
  }, {
    key: '_repositionCanvas',
    value: function _repositionCanvas() {
      // TODO(bckenny): *should* only be executed on RAF, but in current browsers
      //     this causes noticeable hitches in map and overlay relative
      //     positioning.

      var map = this.getMap();

      // topLeft can't be calculated from map.getBounds(), because bounds are
      // clamped to -180 and 180 when completely zoomed out. Instead, calculate
      // left as an offset from the center, which is an unwrapped LatLng.
      var top = map.getBounds().getNorthEast().lat();
      var center = map.getCenter();
      var scale = Math.pow(2, map.getZoom());
      var left = center.lng() - this._cssWidth * 180 / (256 * scale);
      this._topLeft = new google.maps.LatLng(top, left);

      // Canvas position relative to draggable map's container depends on
      // overlayView's projection, not the map's. Have to use the center of the
      // map for this, not the top left, for the same reason as above.
      // https://developers.google.com/maps/documentation/javascript/reference?hl=ko#MapCanvasProjection
      var projection = this.getProjection();
      var divCenter = projection.fromLatLngToDivPixel(center);
      var offsetX = -Math.round(this._cssWidth / 2 - divCenter.x);
      var offsetY = -Math.round(this._cssHeight / 2 - divCenter.y);
      this._element.style[CSS_TRANSFORM] = 'translate(' + offsetX + 'px,' + offsetY + 'px)';

      // TODO 이 로직을 대체해야한다. redraw ..
      // this.scheduleUpdate();
      this._update();
    }

    /**
     * Internal callback that serves as main animation scheduler via
     * requestAnimationFrame. Calls resize and update callbacks if set, and
     * schedules the next frame if overlay is animated.
     * @private
     */

  }, {
    key: '_update',
    value: function _update() {
      var _this2 = this;

      if (!this._isAdded) return;

      if (this._needsResize && this._resizeHandler) {
        this._needsResize = false;
        this._resizeHandler();
      }

      if (this._updateHandler) {
        (function () {
          var self = _this2;
          setTimeout(function () {
            self._updateHandler();
          }, 1);
        })();
      }
    }
  }, {
    key: 'options',
    set: function set(options) {
      this._element = options.element;

      if (options.paneName !== undefined) this.paneName = options.paneName;

      if (options.updateHandler !== undefined) this.updateHandler = options.updateHandler;

      if (options.resizeHandler !== undefined) this.resizeHandler = options.resizeHandler;

      if (options.resolutionScale !== undefined) this.resolutionScale = options.resolutionScale;

      if (options.map !== undefined) this.setMap(options.map);
    }

    /**
     * Set the MapPane in which this layer will be displayed, by name. See
     * {@code google.maps.MapPanes} for the panes available.
     * @param {string} paneName The name of the desired MapPane.
     */

  }, {
    key: 'paneName',
    set: function set(paneName) {
      this._paneName = paneName;

      this._setPane();
    }

    /**
     * @return {string} The name of the current container pane.
     */
    ,
    get: function get() {
      return this._paneName;
    }
  }, {
    key: 'resizeHandler',
    set: function set(resizeHandler) {
      this._resizeHandler = resizeHandler;
    }

    /**
     * Sets a value for scaling the element resolution relative to the element
     * display size. This can be used to save computation by scaling the backing
     * bufferdown, or to support high DPI devices by scaling it up (by e.g.
     * window.devicePixelRatio).
     * @param {number} scale
     */

  }, {
    key: 'resolutionScale',
    set: function set(scale) {
      if (typeof scale === 'number') {
        this._resolutionScale = scale;
        this._resize();
      }
    }

    /**
     * Set a function that will be called when a repaint of the element is required.
     * If opt_updateHandler is null or unspecified, any existing callback is
     * removed.
     * @param {?function=} opt_updateHandler The update callback function.
     */

  }, {
    key: 'updateHandler',
    set: function set(updateHandler) {
      this._updateHandler = updateHandler;
    }

    /**
     * A convenience method to get the current LatLng coordinate of the top left of
     * the current view of the map.
     * @return {google.maps.LatLng} The top left coordinate.
     */

  }, {
    key: 'topLeft',
    get: function get() {
      return this._topLeft;
    }
  }]);

  return GmapOverlay;
}(google.maps.OverlayView);

exports.default = GmapOverlay;

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gmapOverlay = require('./gmap-overlay');

Object.defineProperty(exports, 'GmapOverlay', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_gmapOverlay).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.GmapOverlay = exports.GmapOverlay;

},{"./gmap-overlay":1}]},{},[2]);
