var molly_guard = false;
window.onbeforeunload = function() {
  if (molly_guard)
    return "You are in the middle of a game."
}
