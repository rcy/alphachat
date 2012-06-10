define ['backbone'], (Backbone) ->

  class Timer extends Backbone.Model
    defaults:
      seconds: 60
      percent: 100

    initialize: ->

    start: (seconds) ->
      clearTimeout @tickTimer
      @set 'seconds', (seconds or @defaults.seconds)
      @set 'percent', 101
      @set 'start_time', Date.now()
      @update this
      @trigger 'start', seconds

    stop: ->
      clearTimeout @tickTimer

    reset: ->
      @set 'percent', 100

    update: =>
      percent = (100 - ((Date.now() - @get('start_time')) / (1000*@get('seconds')) * 100))
      percent = 0 if percent < 0
      @set 'percent', percent # this triggers view update
      if percent > 0
        @tickTimer = setTimeout @update, 100
      else
        @trigger 'expire'
