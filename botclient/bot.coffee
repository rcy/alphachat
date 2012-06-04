class AlphaBot
  constructor: ->
    @io = require('socket.io-client')
    @socket = @io.connect 'http://localhost:5000', 'force new connection':true

    @socket.on 'connect', () =>
      console.log 'connect!'
      @socket.emit 'join'

    @socket.on 'names', (data) =>
      console.log 'names', data
      @tick()

  tick: () ->
    @socket.emit 'chat', body: "annoying"
    setTimeout (=> @tick()), 100 * Math.random()*100


a = new AlphaBot()
