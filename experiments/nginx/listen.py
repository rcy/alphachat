import httplib

channel='xyzzy'

conn = httplib.HTTPConnection('localhost:8088')

def getmsg(last_response):
    #print 'sent request...'
    new_headers = {}

    if last_response:
        last_modified = last_response.getheader('Last-Modified')
        last_etag = last_response.getheader('Etag')
        new_headers = {'If-Modified-Since': last_modified,
                       'If-None-Match': last_etag }

        print 'etag: ' + last_etag

    conn.request('GET', '/activity?id='+channel, headers=new_headers)
    r = conn.getresponse()
    data = r.read()
    print "MESSAGE: " + data
    #print 'sent request...done'
    return r

r = None
while True:
    r = getmsg(r)
