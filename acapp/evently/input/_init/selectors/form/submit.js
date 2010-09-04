function() {
  var form = $(this);
  var input = form.serializeObject().input;
  var doc = {};
  doc.created_at = new Date();
  doc.sender = GLOBAL.me;
  doc.type = 'message';
  doc.cmd = 'chat';
  doc.body = input;
  form[0].reset();

  $("#status").html('++');
  $$(this).app.db.saveDoc(doc, {
    success : function() {
      $("#status").html('--');
    }
  });

  //$("#items").trigger("self", [doc]);
  return false;
};
