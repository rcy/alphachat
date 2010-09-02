function(row) {
  var profile = $$("#profile").profile;
  var me = profile && profile.name;
  var v = row.value;
  var d = {
    message: $.linkify(v.message),
    nickname: v.profile && v.profile.nickname || "SYSTEM",
    name: v.profile && v.profile.name || "SYSTEM"
  };
  return (d.name !== me) && d;
};
