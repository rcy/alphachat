function (doc) {
    if (doc.doc_type == 'Message') {
        emit (doc.body, doc);
    }
}
