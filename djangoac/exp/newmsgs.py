# long poll new message test

from couchdbkit import Server, Consumer
s = Server()
db = s.get_or_create_db("alphachat")
c = Consumer(db)
#print c.wait_once(filter="alphachat/message_by_room_id", by='test-room', timeout=1000)
r = c.wait_once(filter="alphachat/generic", 
                doc_type='Message', 
                by_key='room_id', by_value='test-room', 
                timeout=1000)
message_ids = map(lambda m: m['id'], r['results'])

print r
print
print

for mid in message_ids:
    print db.get(mid)
