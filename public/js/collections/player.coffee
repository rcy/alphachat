define [
  'models/player'
], (Player) ->

  class PlayerCollection extends Backbone.Collection
    model: Player

    initialize: ->
      console.log 'initialize PlayerCollection'
      this.bind "add", (player) ->
        console.log 'added player: ' + player.get('nick')

  new PlayerCollection
