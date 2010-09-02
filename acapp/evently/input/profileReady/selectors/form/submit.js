function() {
  var form = $(this);
  var fdoc = form.serializeObject();
  fdoc.created_at = new Date();
  fdoc.profile = $$("#profile").profile;
  form[0].reset();
  $$(this).app.db.saveDoc(fdoc, {
    success : function() {
    }
  });
  $("#items").trigger("self", [fdoc]);
  return false;
};
