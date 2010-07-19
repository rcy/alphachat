function (doc) {
    if (doc.doc_type == 'Player') {
        emit (doc._id, doc);
    }
}
