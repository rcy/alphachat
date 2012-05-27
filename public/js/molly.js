var molly_guard = true;
window.onbeforeunload = function() {
  if (molly_guard)
    return "You are in the middle of a game."
}
