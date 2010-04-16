# this commit fixes this:
# http://github.com/benoitc/couchdbkit/commit/0a17f49e175dc155f0db59fd65a0d9ca5578b4f5
from couchdbkit import Server, Document
s = Server('http://localhost:5984')
db = s.get_or_create_db('silly')
Document.set_db(db)
doc = Document(extra_stuff = 'whatever')
doc.save()
dic = db[doc._id]
print dic
doc = Document(_d=dic)
# ReservedWordError: Cannot define property using reserved word '_rev'.

