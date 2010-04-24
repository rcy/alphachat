#!/usr/bin/python
import datetime, random
from couchdbkit import Server, Document
from couchdbkit import StringProperty, ListProperty
import gevent
import gevent.monkey
from time import sleep
import sys, os
sys.path.append('..')
from alphachat.schema import PlayerDoc, RoomDoc, MessageDoc, VoteDoc
from alphachat.event import wait_for_change, get_seq
from alphachat.debug import log

gevent.monkey.patch_all()

s = Server()
db = s.get_or_create_db("alphachat")

class Player(PlayerDoc): pass
Player.set_db(db)
class Room(RoomDoc): pass
Room.set_db(db)
class Vote(VoteDoc): pass
Vote.set_db(db)
class Message(MessageDoc): pass
Message.set_db(db)

colors = ['red','green','blue']

def create_player():
    p = Player()
    p.fb_uid = 'bot'
    p.save()
    log('created: %s'%p._id)
    return p

p = create_player()
p.state = 'ondeck'
p.save()
since = get_seq(db)

# wait until we are notified to join a room
wait_for_change(p, since)
p = p.get(p._id)

# join the room
print "sleeping (todo: avoid race)"
gevent.sleep(5)
m = Message().Join(p.room_id, p._id)
m.save()
print 'join message:', m._id
p.join = True
p.save()

# we are joined now, listen for messages, and say stuff once inawhile
while True:
    p = p.get(p._id)
    print p.state
    if p.state == 'endgame':
        break
    Message().Chat(p.room_id, p._id, "hello guys").save()
    gevent.sleep(5)
