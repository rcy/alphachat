define [
  'backbone'
], (Backbone) ->

  class Player extends Backbone.Model
    idAttribute: "id"

    defaults:
      nick: 'nobody'
      color: 'black'
      selected: false
      self: false
      socketid: 0     # remove this

    initialize: ->
      console.log 'initialize Player', @attributes
