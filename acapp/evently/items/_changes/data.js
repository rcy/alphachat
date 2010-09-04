function(row) {
  var v = row.value;
//   var d = v;
// {
//     body: $.linkify(v.message),
//     sender: v.sender;
//   };
  console.log(JSON.stringify(v));
  if (v.cmd === 'chat') {
    v.is_chat = true;
  }
  return v;
};
