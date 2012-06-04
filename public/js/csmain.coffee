define [
  'jquery', 'underscore', 'backbone',
  'cs!models/player', 'cs!collections/player',
  'cs!collections/message',
  'cs!views/app'
], ($, _, Backbone, Player, Players, Messages, AppView) ->

  app = new AppView

  socket = io.connect()

  socket.on 'error', (data) -> alert 'error'; console.log 'error', data

  app.on 'vote', (player) -> socket.emit 'vote', player.id

  socket.on 'connect', (client) ->
    app.connect()
    socket.emit 'join'

  socket.on 'disconnect', () -> app.disconnect()

  socket.on 'join', (nick) ->
    console.log 'join', nick
    Players.add new Player nick:nick, id:nick

  socket.on 'start_timer', (data) -> app.start_timer data
  socket.on 'stop_timer', (data) -> app.stop_timer data

  socket.on 'chat', (data) -> app.chat data

  socket.on 'names', (data) ->
    console.log 'names', data
    for nick in data.nicks
      p = new Player nick: nick, id: nick
      Players.add p
    p = Players.get data.self
    p.set 'self', true

  socket.on 'part', (data) ->
    console.log 'part', data.nick
    Players.remove Players.get(data.nick)

  $('form.chat input').focus()

  $('form.chat').on 'submit', (e) ->
    e.preventDefault()
    $input = $(e.currentTarget).find('input')
    if $input.val() isnt ''
      socket.emit 'chat', { body: $input.val() }
      $input.val ''
      $input.attr 'placeholder',''
