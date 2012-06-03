define [
  'underscore'
  'backbone'
], (_, Backbone) ->
  # use a event dispatcher to keep views decoupled
  dispatcher = _.clone(Backbone.Events)
  dispatcher
