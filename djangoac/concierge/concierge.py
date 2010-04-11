#!/usr/bin/python
from couchdbkit import Server, Document
from couchdbkit import StringProperty, ListProperty
from time import sleep

s = Server()
db = s.get_or_create_db("alphachat")

class Player(Document):
    state = StringProperty()
Player.set_db(db)

class Room(Document):
    players = ListProperty()
    state = StringProperty()
Room.set_db(db)

color = ['red','green','blue']

def create_chat(players):
    print 'creating a room for', players

    # create the room

    if db.doc_exist('room-foobar'):
        r = db.get('room-foobar')
    else:
        r = Room(_id = 'room-foobar', state = 'chat', )
        r.save()
        print 'created room:', r._id

    
    # mark the players as chatting in the room
    for player, i in zip(players, range(0, len(players))):
        print 'moving %s to chat in %s' % (player.fb_uid, r['_id'])
        player.state = 'chat'
        player.room_id = r['_id']
        player.color = color[i]
        player.save()

chat_min = 2
# TODO: use the _changes api to make this more efficient, and less noisy on the logs
if __name__ == '__main__':
    print "Concierge started.  Waiting for players in state == 'ondeck'"
    while True:
        lobby_players = Player.view('alphachat/player__state', key='lobby').all()
        if lobby_players:
            print "lobby:",map(lambda p: str(p.fb_uid), lobby_players)

        ondeck_players = Player.view('alphachat/player__state', key='ondeck').all()
        if ondeck_players:
            print "ondeck:",map(lambda p: str(p.fb_uid), ondeck_players)

        if (len(ondeck_players) >= chat_min):
            create_chat(ondeck_players[0:chat_min])
        sleep (1)
