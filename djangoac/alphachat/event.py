from alphachat.debug import log
from couchdbkit import Consumer, Document

def get_seq(db):
    return db.info()['update_seq']

def wait_for_change(db, doc, since=0, timeout=60000):
    assert int(since) > 0
    log("update_seq: %s"%get_seq(db))
    log("info: wait_for_change on _id: %s, _rev: %s" % (doc['_id'], doc['_rev']))
    docid = doc['_id']
    rev = doc['_rev']
    c = Consumer(db)
    
    r = c.fetch(filter="alphachat/generic",
                by_key='_id', by_value=docid, since=since)
    log('fetch: %s'%r)
    if r['results']:
        rev = r['results'][0]['changes'][0]['rev']
        if rev != doc['_rev']:
            # we already have our change
            log('WARNING: %s changed really quickly' % doc['_id'])
            return db[doc['_id']]

    last_seq = r['last_seq']
    r = c.wait_once(filter="alphachat/generic",
                    by_key='_id', by_value=docid,
                    since = last_seq,
                    timeout=timeout)
    log('poll: %s'%r)
    if len(r['results']) > 0:
        return db[doc['_id']]
    else:
        log('timed_out: no changes')

def wait_for_changes(db, doc_type=None, by_key=None, by_value=None, since=0, timeout=60000):
    assert int(since) > 0
    log('>>> wait_for_changes %s'%since)
    c = Consumer(db)
    log('>>> wait_for_changes a')
    r = c.wait_once(filter="alphachat/generic",
                    doc_type=doc_type,
                    by_key=by_key, by_value=by_value,
                    since=since,
                    timeout=timeout)
    log('>>> wait_for_changes b')
    # we should be able to fetchall these in one POST
    # http://wiki.apache.org/couchdb/HTTP_view_API
    ids = map(lambda m: m['id'], r['results'])
    log('>>> wait_for_changes c')
    docs = map(lambda i: db.get(i), ids)
    log('<<< wait_for_changes')
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

