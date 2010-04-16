function (doc) {
    if (doc.doc_type == 'Message') {
        emit (doc.creation_time, doc);
    }
}
