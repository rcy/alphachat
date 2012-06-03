define [
  'jquery', 'underscore', 'backbone'
], ($, _, Backbone) ->

  class MessageView extends Backbone.View
    tagName: 'li'

    template: _.template $('#message-template').html()

    initialize: ->
      # this.model.bind('change', this.render, this);

    render: ->
      this.$el.html this.template(this.model.toJSON())
      this
