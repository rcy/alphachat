define ['backbone'], (Backbone) ->

  class Timer extends Backbone.Model
    defaults:
      seconds: 60
      percent: 100

    initialize: ->

    start: (seconds) ->
      clearTimeout this.tickTimer
      this.set 'seconds', (seconds or this.defaults.seconds)
      this.set 'percent', 101
      this.set 'start_time', Date.now()
      this.update(this)
      this.trigger 'start', seconds

    stop: ->
      clearTimeout this.tickTimer

    reset: ->
      this.set 'percent', 100

    update: =>
      percent = (100 - ((Date.now() - this.get('start_time')) / (1000*this.get('seconds')) * 100))
      percent = 0 if percent < 0
      this.set 'percent', percent # this triggers view update
      if percent > 0
        that = this
        this.tickTimer = setTimeout this.update, 100
      else
        this.trigger 'expire'
