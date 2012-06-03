define [
  'backbone'
  'cs!models/player'
], (Backbone, Player) ->

  class Message extends Backbone.Model
    defaults:
      player: null
      body: ""

    initialize: ->
      console.log 'initialize Message'
      this.set 'time', (new Date()).toString().split(/\s/)[4]
