function(doc) {
  if (doc.type === "ex") {
    emit(doc._local_seq, doc);
  }
};
