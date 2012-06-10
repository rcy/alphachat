describe 'Hookable', ->
  Hookable = require '../lib/hookable'

  it 'should create hookable class', (done) ->
    e = new Hookable
    thing = 'nothing'
    e.on 'hello', (target) ->
      target.should.equal 'world'
      done()

    e.trigger 'hello', 'world'
