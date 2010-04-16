from couchdbkit import Server, Consumer
s = Server()
db = s.get_or_create_db("mydb")
c = Consumer(db)

db.save_doc({})
db.save_doc({})
db.save_doc({})

def print_line(line):
    print "got '%s'" % line

c.register_callback(print_line)
c.wait()
