function (doc) {
    if (doc.doc_type == 'Room') {
        emit (doc.state, doc);
    }
}
