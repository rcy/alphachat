define [
  'backbone'
], (Backbone) ->

  class Player extends Backbone.Model
    idAttribute: "_id"

    defaults:
      nick: 'nobody'
      color: 'black'
      selected: false
      self: false
      socketid: 0     # remove this

    initialize: ->
      console.log 'initialize Player', this.attributes
