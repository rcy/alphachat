function(row) {
  var v = row.value;
  if (v._local_seq > STARTSEQ) {
    console.log(JSON.stringify(v));
    if (v.cmd === 'chat') {
      v.is_chat = true;
    }
    return v;
  }
}
