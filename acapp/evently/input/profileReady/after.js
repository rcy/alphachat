function() {
  // announce that we've logged in
  var name = $$("#profile").profile.name;
  var fdoc = {message: name + " has JOINED"};
  $$(this).app.db.saveDoc(fdoc, {});

  $("#chatinput").focus();
}
