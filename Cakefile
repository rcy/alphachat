# Cakefile

{exec} = require "child_process"

REPORTER = "dot"

task "test", "run tests", ->
  exec "NODE_ENV=test 
    ./node_modules/.bin/mocha
    --no-colors
    --compilers coffee:coffee-script
    --reporter #{REPORTER}
    --require coffee-script
    --require should
  ", (err, output) ->
    throw err if err
    console.log output
