function (doc) {
    if (doc.doc_type == 'Vote') {
        emit (doc.room_id, doc);
    }
}
