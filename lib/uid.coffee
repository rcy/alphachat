# simple unique identifier generator

id = 0

uid = ->
  id += 1

module.exports = uid
