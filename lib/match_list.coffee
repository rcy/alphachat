Match = require './match'
Hookable = require './hookable'

class MatchList extends Hookable
  constructor: ->
    @current = null
    super

  create: (options) ->
    @current = new Match options
    @trigger 'create_match', @current
    @current

  get_or_create: (options, cb) ->
    unless @current and @current.is_waiting_for_players()
      @current = @create options
    cb(@current) if cb

module.exports = MatchList
