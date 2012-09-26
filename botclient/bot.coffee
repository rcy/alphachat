class AlphaBot
  constructor: ->
    @io = require('socket.io-client')
    @socket = @io.connect 'http://localhost:5000', 'force new connection':true

    @socket.on 'connect', () =>
      console.log 'connect!'
      @socket.emit 'join'

    @socket.on 'names', (data) =>
      console.log 'names', data

    @socket.on 'start_timer', (data) =>
      @can_chat = true
      @tick()

    @socket.on 'stop_timer', (data) =>
      console.log 'stop_timer', data
      @can_chat = false

    @socket.on 'chat', (data) =>
      console.log 'chat', data

    @socket.on 'part', (data) =>
      console.log 'part', data

    @socket.on 'join', (data) =>
      console.log 'join', data

  tick: () ->
    if @can_chat
      @socket.emit 'chat', body: "annoying"
      setTimeout (=> @tick()), 100 * Math.random()*100


new AlphaBot() for i in [0..0]
