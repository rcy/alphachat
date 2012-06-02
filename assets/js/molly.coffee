molly_guard = false

window.onbeforeunload = () ->
  if molly_guard
    "You are in the middle of a game."
