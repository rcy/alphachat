#!/usr/bin/python
from couchdbkit import Server, Document, StringProperty
from time import sleep

s = Server()
db = s.get_or_create_db("alphachat")

class Player(Document):
    state = StringProperty()
Player.set_db(db)

def run():
    while True:
        print "concierge, foo!"
        players = Player.view('alphachat/player__state', key='lobby').all()
        for player in players:
            print player.fb_uid, player.state
            player.state = 'chat'
            player.save()
        sleep (1)

run()
