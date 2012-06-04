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

    reset: ->
      console.log "RESET"

    remove: ->
      this.$el.fadeOut(5000)

    render: ->
      locals = this.model.toJSON()
      this.$el.html(this.template(locals))

      if locals.self
        mynick = this.model.get('nick')
        this.$el.html(mynick + ' (me) ')
        $("#self").html mynick
      else
        if this.model.get 'selected'
          this.$el.addClass 'active'
        else
          this.$el.removeClass 'active'

        if this.model.get 'self'
          this.$el.addClass 'self'

      this

    vote: ->
      unless this.model.get 'selected'
        dispatcher.trigger 'vote', this.model
