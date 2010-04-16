function (doc) {
    if (doc.doc_type == 'Player') {
        emit (doc.room_id, doc);
    }
}
