define [
  'jquery', 'underscore', 'backbone',
  'cs!models/player', 'cs!collections/player',
  'cs!collections/message',
  'cs!views/app'
], ($, _, Backbone, Player, Players, Messages, AppView) ->

  app = new AppView

  socket = io.connect()

  socket.on 'error', (d) -> alert 'error'; console.log 'error', d

  app.on 'vote', (player) ->
    console.log 'toplevel got vote', player
    socket.emit 'vote', player.attributes

  socket.on 'connect', (client) ->
    app.connect()
    socket.emit 'join'

  socket.on 'disconnect', () ->
    app.disconnect()

  socket.on 'join', (doc) -> Players.add new Player(doc)

  socket.on 'start_timer', (data) ->
    console.log 'got: start_timer', data
    app.start_timer data

  socket.on 'stop_timer', (data) ->
    console.log 'got: stop_timer', data
    app.stop_timer data

  socket.on 'chat', (d) ->
    console.log 'chat: ', d
    p = app.socketPlayer d.sender
    if p
      Messages.add { body: d.body, player: p }
    else
      console.log 'unknown player sent chat:', d

  socket.on 'names', (docs) ->
    console.log 'names', docs
    for obj in docs
      p = new Player obj
      Players.add p

  socket.on 'part', (doc) ->
    console.log 'part', doc
    Players.remove Players.get(doc._id)

  $('form.chat input').focus()

  $('form.chat').on 'submit', (e) ->
    e.preventDefault()
    $input = $(e.currentTarget).find('input')
    if $input.val() isnt ''
      socket.emit 'chat', { body: $input.val() }
      $input.val ''
      $input.attr 'placeholder',''
