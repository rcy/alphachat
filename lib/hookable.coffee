class Hookable
  constructor: ->
    @hooks = {}

  on: (name, fn) ->
    @hooks[name] = fn

  trigger: (name, args) ->
    fn = @hooks[name]
    fn && fn(args)

module.exports = Hookable