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
from alphachat.event import wait_for_change, get_seq, Timeout
from alphachat.debug import log

gevent.monkey.patch_all()

random.seed()

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

def create_player():
    p = Player()
    p.fb_uid = 'bot'
    p.save()
    log('created: %s'%p._id)
    return p
p = create_player()

colors = ['red','green','blue']

def random_message():
    import subprocess, os
    command = "fortune -s -n 70"
    process = subprocess.Popen(command, stdout=subprocess.PIPE, shell=True)
    os.waitpid(process.pid, 0)
    output = process.stdout.read().strip()
    return output

def play():
    global p
    log("starting to play")
    p.state = 'ondeck'
    p.save()

    # wait until we are notified to join a room
    while p.state == 'ondeck': 
        try:
            wait_for_change(p, since)
        except Timeout:
            pass
        p = p.get(p._id)

    # join the room
    print "sleeping (todo: avoid race)"
    gevent.sleep(1)
    m = Message().Join(p.room_id, p._id)
    m.save()
    print 'join message:', m._id
    p.join = True
    p.save()

    # we are joined now, listen for messages, and say stuff once inawhile
    while True:
        gevent.sleep(random.randrange(5,20))
        p = p.get(p._id)
        print p.state
        if p.state == 'endgame':
            break
        elif p.state == 'chat':
            Message().Chat(p.room_id, p._id, random_message()).save()

since = get_seq(db)
while True:
    play()
