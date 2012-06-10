describe 'Match', ->
  Match = require '../lib/match'

  describe 'create match', ->
    m = new Match
    it 'should assign an id to the match', ->
      m.should.have.property 'id'

    it 'should not share ids with other match instances', ->
      n = new Match
      m.id.should.not.equal n.id

  describe 'add_player', ->
    m = new Match
    numplayers = m.unused_nicks.length
    m.add_player()

    it 'should remove a player from unused_nicks', ->
      m.unused_nicks.length.should.equal numplayers - 1

    it 'should add 1 to the players array', ->
      m.nicks.length.should.equal 1

    it 'should callback with a nick', (done) ->
      m.add_player (nick) ->
        nick.should.be.a.string
        nick.should.match /^[A-Za-z]+$/
        done()
        
  describe 'options', ->
    it 'should set options to default values if not supplied', ->
      m = new Match
      m.options.num_players_needed.should.equal 5

  describe 'start round', ->
    m = new Match {num_players_needed: 1, seconds_per_round: 32}

    it 'should call start_round handler when enough players have been added', (done) ->
      m.on 'start_round', (obj) ->
        obj.seconds.should.equal 32
        done()
      m.add_player()
      m.add_player()
      m.add_player()

  describe 'end round', ->
    it 'should call end_round handler after starting match when enough time has passed', (done) ->
      m = new Match {num_players_needed: 1, seconds_per_round: .1}
      m.on 'end_round', -> done()
      m.add_player()
