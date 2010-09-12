function display(sel, obj) {
  if (sel && obj && template[obj.cmd]) {
    var html = Mustache.to_html(template[obj.cmd], obj);
    //util.log(html);
    sel && sel.append(html);
  } else {
    util.log(["no template for", obj]);
  }
}
$("form.chat input").focus();

$(window).bind('resize', function() { util.scrollDown();});

$("form.chat").submit(function(e) { 
  var inp = $(this).find("input");
  if (inp.val().charAt(0) === '/') {
    send(socket, 'command', inp.val().substring(1).split(/\s+/));
  } else {
    send(socket, 'privmsg', inp.val());
  }
  inp.val('');
  return false;
});
