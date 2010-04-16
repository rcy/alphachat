function (doc) {
    if (doc.doc_type == 'Player') {
        emit (doc.fb_uid, doc);
    }
}
