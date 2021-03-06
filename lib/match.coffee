# a match consists of a group of players and several matches

uid = require './uid'
Hookable = require './hookable'

class Match extends Hookable
  constructor: (options) ->
    options ||= {}
    options.num_players_needed ||= 5
    options.seconds_per_round ||= 60
    @options = options

    @id = uid()

    @nicks = []
    @unused_nicks = ["Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu",
                     "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"];
    @state = 'waiting'
    super

  is_waiting_for_players: ->
    @state == 'waiting'

  add_player: (cb) ->
    nick = @unused_nicks.pop()
    @nicks.push nick
    cb(nick) if cb
    @start_round() if @nicks.length == @options.num_players_needed

  remove_player: (nick, cb) ->
    index = @nicks.indexOf nick
    @nicks.splice(index, 1) if index >= 0

  start_round: ->
    @state = 'playing'
    @trigger 'start_round', {seconds: @options.seconds_per_round}
    setTimeout (=> @end_round()), 1000 * @options.seconds_per_round

  end_round: =>
    @trigger 'end_round'

module.exports = Match
