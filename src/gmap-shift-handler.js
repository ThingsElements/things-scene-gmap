var { EventMap, MODE_SHIFT } = scene

function onkeydown(e, hint) {
  var app = hint.deliverer.app

  if(e.keyCode == 32 && this.before_mode === undefined) {
    this.before_mode = app.mode
    app.mode = MODE_SHIFT
  }
}

function onkeyup(e, hint) {
  var app = hint.deliverer.app

  if(e.keyCode == 32) {
    if(this.before_mode != undefined)
      app.mode = this.before_mode
    delete this.before_mode
  }
}

EventMap.register('gmap-shift', {
  '(root)': {
    '(self)': {
      keydown: onkeydown,
      keyup: onkeyup
    }
  }
})
