(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _scene = scene;
var EventMap = _scene.EventMap;
var MODE_SHIFT = _scene.MODE_SHIFT;


function onkeydown(e, hint) {
  var app = hint.deliverer.app;

  if (e.keyCode == 32 && this.before_mode === undefined) {
    this.before_mode = app.mode;
    app.mode = MODE_SHIFT;
  }
}

function onkeyup(e, hint) {
  var app = hint.deliverer.app;

  if (e.keyCode == 32) {
    if (this.before_mode != undefined) app.mode = this.before_mode;
    delete this.before_mode;
  }
}

EventMap.register('gmap-shift', {
  '(root)': {
    '(self)': {
      keydown: onkeydown,
      keyup: onkeyup
    }
  }
});

},{}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _gmapShiftHandler = require('./gmap-shift-handler');

Object.defineProperty(exports, 'GmapShiftHandler', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_gmapShiftHandler).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./gmap-shift-handler":1}]},{},[2]);
