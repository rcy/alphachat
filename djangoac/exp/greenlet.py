import gevent
#from gevent import monkey
#monkey.patch_all()
#http://bitbucket.org/denis/gevent/src/tip/examples/concurrent_download.py
from time import sleep

def fn():
    print 'hello'
    sleep(1)
    print 'world'

jobs = [gevent.spawn(fn),gevent.spawn(fn),gevent.spawn(fn),]

print 'foo'

gevent.joinall(jobs)
