# implement sessions to work with facebook
class Session:
    def __init__(self):
        print 'reset session data'
        self.data = {}

    def get(self, request, key):
        print 'get: ', key
        session_key = request.facebook.session_key
        assert session_key
        if not self.data.has_key(session_key):
            return None
        if not self.data[session_key].has_key(key):
            return None
        return self.data[session_key][key]

    def set(self, request, key, val):
        print 'set:', key, ',', val
        session_key = request.facebook.session_key
        assert session_key
        if not self.data.has_key(session_key):
            self.data[session_key] = {}
        self.data[session_key][key] = val
