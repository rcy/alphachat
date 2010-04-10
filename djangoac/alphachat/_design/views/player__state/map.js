function (doc) {
    if (doc.doc_type == 'Player') {
        emit (doc.state, doc);
    }
}
