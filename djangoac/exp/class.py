from couchdbkit import Server, Document
s = Server('http://localhost:5984')
db = s.get_or_create_db('silly')
Document.set_db(db)
doc = Document(extra_stuff = 'whatever')
doc.save()
dic = db[doc._id]
print dic
Document(_d=dic)
# ReservedWordError: Cannot define property using reserved word '_rev'.
