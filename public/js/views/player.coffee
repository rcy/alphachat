define [
  'jquery', 'underscore', 'backbone',
  'cs!dispatcher'
], ($, _, Backbone, dispatcher) ->

  class PlayerView extends Backbone.View
    tagName: 'li'

    template: _.template($('#player-template').html())

    events:
      'click a': 'vote'

    initialize: ->
      this.model.bind 'change', this.render, this
      this.model.bind 'remove', this.remove, this

    remove: ->
      this.$el.fadeOut()

    render: ->
      this.$el.html(this.template(this.model.toJSON()))
      if this.model.get 'selected'
        this.$el.addClass 'active'
      else
        this.$el.removeClass 'active'
      this

    vote: ->
      unless this.model.get 'selected'
        dispatcher.trigger 'vote', this.model
