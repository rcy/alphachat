define [
  'cs!models/message'
], (Message) ->

  class MessageCollection extends Backbone.Collection
    model: Message

    initialize: ->
      console.log 'initialize MessageCollection'
      this.bind 'add', (msg) ->
        console.log 'added msg: ' + msg.get 'body'

  new MessageCollection

