define [
  'jquery', 'underscore', 'backbone',
  'cs!models/player', 'cs!collections/player', 'cs!views/player',
  'cs!models/message', 'cs!collections/message','cs!views/message',
  'cs!models/timer', 'cs!views/timer',
  'cs!dispatcher'
], ($, _, Backbone,
    Player, Players, PlayerView, 
    Message, Messages, MessageView,
    Timer, TimerView, 
    dispatcher) ->

  class AppView extends Backbone.View
    el: $("#app")

    initialize: ->
      this.$el.show()
      Messages.bind 'add', this.addMessage, this
      Players.bind 'add', this.addPlayer, this
      this.connectedEl = $('#connected')

      this.timer = new Timer()
      this.timer.reset()
      this.timerView = new TimerView { model: this.timer }

      dispatcher.bind 'vote', this.vote, this

    vote: (player) ->
      console.log 'vote', player
      _.each Players.models, (p) ->
        p.set 'selected', (p == player)

      this.trigger 'vote', player

    start_timer: (obj) ->
      this.timer.start obj.seconds
      # vote for one of the opponents automatically
      this.vote Players.where({self: false})[0]

    stop_timer: (obj) ->
      this.timer.stop()

    addMessage: (msg) ->
      view = new MessageView { model: msg }
      this.$("#msg-list").append view.render().el
      $("#msg-list").scrollTop $("#msg-list")[0].scrollHeight

    addPlayer: (player) ->
      view = new PlayerView { model: player }
      this.$("#opponents").append view.render().el

    connect: ->
      console.log 'app connect'
      this.connectedEl.html 'connected'
      this.connectedEl.removeClass 'label-important'
      this.connectedEl.addClass 'label-success'

    disconnect: ->
      this.connectedEl.html 'disconnected'
      this.connectedEl.removeClass 'label-success'
      this.connectedEl.addClass 'label-important'

    chat: (data) ->
      console.log 'chat: ', data
      p = Players.get(data.sender)
      if p
        Messages.add { body: data.body, player: p }
      else
        console.log 'unknown player sent chat:', data
