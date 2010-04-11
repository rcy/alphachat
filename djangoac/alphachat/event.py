from couchdbkit import Consumer, Document

def wait_for_change(db, doc, timeout=10000):
    print "info: wait_for_doc_change on _id: %s, _rev: %s" % (doc['_id'], doc['_rev'])
    docid = doc['_id']
    rev = doc['_rev']
    c = Consumer(db)
    
    r = c.fetch(filter="alphachat/generic",
                by_key='_id', by_value=docid)
    print 'fetch:',r
    rev = r['results'][0]['changes'][0]['rev']
    if rev != doc['_rev']:
        # we already have our change
        print 'WARNING: %s changed really quickly' % doc['_id']
        return db[doc['_id']]
    else:
        last_seq = r['last_seq']
        r = c.wait_once(filter="alphachat/generic",
                        by_key='_id', by_value=docid,
                        since = last_seq,
                        timeout=timeout)
        print 'poll:',r
        if len(r['results']) > 0:
            return db[doc['_id']]
        else:
            print 'timed_out:'
            pass

def wait_for_changes(db, doc_type=None, by_key=None, by_value=None, since=0, timeout=10000):
    c = Consumer(db)
    r = c.wait_once(filter="alphachat/generic",
                    doc_type=doc_type,
                    by_key=by_key, by_value=by_value,
                    since=since,
                    timeout=timeout)
    # we should be able to fetchall these in one POST
    # http://wiki.apache.org/couchdb/HTTP_view_API
    ids = map(lambda m: m['id'], r['results'])
    docs = map(lambda i: db.get(i), ids)
    return docs, r['last_seq']

if __name__ == '__main__':
    s = Server('http://localhost:5984')
    db = s.get_or_create_db('alphachat')
    Document.set_db(db)
    doc = db['monkey']
    print "go change doc '%s' now, or wait until after the fetch" % doc['_id']
    sleep(10)
    newdoc = wait_for_change(db, doc, 10000)
    print 'newdoc:',newdoc

