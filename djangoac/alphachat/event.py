from gevent.event import Event
#from gevent import Greenlet
from couchdbkit import Consumer, Document

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

    def wait_for_doc_change(self, olddoc, timeout):
        # TODO: ok.  yes.  this is a polling loop.  i know.  i'm
        # waiting to replace it with the continuous feed api when
        # @benoitc has his gevent version stable.  this is not
        # production ready at all.
        print "info: wait_for_doc_change on _id: %s, _rev: %s" % (olddoc._id, olddoc._rev)
        sleep_event = Event()
        while True:
            newdoc = olddoc.get(olddoc._id)
            if olddoc._rev != newdoc._rev:
                return newdoc
            sleep_event.wait(1)
