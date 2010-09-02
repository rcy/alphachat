function(e, v) {
  var d = {
    message: v.message,
    nickname: v.profile && v.profile.nickname || "SYSTEM",
    name: v.profile && v.profile.name || "SYSTEM"
  };
  return d;
}
