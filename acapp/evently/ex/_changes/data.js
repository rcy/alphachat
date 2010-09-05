function(row) {
  console.log(JSON.stringify(row));

  // supress handling of initial messages
  if (row.value._local_seq > STARTSEQ) {
    return row.value;
  }
}
