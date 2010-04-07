import httplib

channel='xyzzy'

def getmsg(last_response):
    new_headers = {}

    if last_response:
        last_modified = last_response.getheader('Last-Modified')
        last_etag = last_response.getheader('Etag')
        new_headers = {'If-Modified-Since': last_modified,
                       'If-None-Match': last_etag }
        print ('Last-Modified: ' + last_modified)
        print ('Etag: ' + last_etag)

    conn = httplib.HTTPConnection('localhost:8088')
    print "SEND"
    conn.request('GET', '/activity?id='+channel, headers=new_headers)
    r = conn.getresponse()
    data = r.read()
    print "responseText: " + data
    return r

r = None
while True:
    r = getmsg(r)
