from gevent.event import Event
#from gevent import Greenlet
from couchdbkit import Consumer

class EventManager:
    events = {}
    def sleep(self, timeout, key):
        e = self.events
        if not e.has_key(key):
            e[key] = Event()
        e[key].wait(timeout)

    def wakeup(self, key):
        e = self.events
        e[key].set()
        del e[key]

    def wait_for_doc_change(self, doc, timeout):
        db = doc.get_db()
        c = Consumer(db)
        #c.register_callback(lambda line: self.is_newer(line, doc))
        print c.fetch(filter="alphachat/byid", docid=doc._id)

    # def is_newer(self, line, doc):
    #     print 'got %s' % line
