#!/usr/bin/python
from couchdbkit import Server, Document
from couchdbkit import StringProperty, ListProperty
import gevent
from time import sleep
import sys, os
sys.path.append('..')
from alphachat.schema import PlayerDoc, RoomDoc, MessageDoc
import referee_settings as settings

s = Server()
db = s.get_or_create_db("alphachat")

class Player(PlayerDoc): pass
Player.set_db(db)
class Room(RoomDoc): pass
Room.set_db(db)
class Message(MessageDoc): pass
Message.set_db(db)

colors = ['red','green','blue']

def create_chat(players):
    print 'creating a room for', players

    # create the room
    room = Room(state = 'chat')
    room.save()
    print 'created room:', room._id

    # mark the players as chatting in the room
    for player, color in zip(players, colors):
        print 'moving %s to chat in %s' % (player.fb_uid, room['_id'])
        player.state = 'chat'
        player.room_id = room['_id']
        player.color = color
        player.save()

    # start two minute timer
    g = gevent.spawn(timer_fn, room._id)

def timer_fn(room_id):
    game_seconds = settings.chat_seconds
    vote_seconds = settings.vote_seconds

    # game time
    Message().info(room_id, "chat for %d seconds" % game_seconds).save()
    Message().time(room_id, game_seconds).save()
    gevent.sleep (game_seconds)
    Message().info(room_id, 'chat is over!').save()
    Message().time(room_id, 0).save()
    print "room %s: chat time is up!" %(room_id,)

    # voting time
    Message().info(room_id, "choose the chatter you preferred (%d seconds)" % vote_seconds).save()
    Message().time(room_id, vote_seconds).save()
    gevent.sleep (vote_seconds)
    Message().info(room_id, 'time is up! TODO: show winner').save()
    Message().time(room_id, 0).save()
    print "room %s: vote time is up!" %(room_id,)


def main_loop():
    print "Referee started.  Waiting for players in state == 'ondeck'"

    old_lobby_player_ids = None
    old_ondeck_player_ids = None
    
    while True: 
        lobby_players = Player.view('alphachat/player__state', key='lobby').all()
        lobby_player_ids = map(lambda p: str(p.fb_uid), lobby_players)
        if lobby_player_ids != old_lobby_player_ids:
            print "lobby:",lobby_player_ids
        old_lobby_player_ids = lobby_player_ids

        ondeck_players = Player.view('alphachat/player__state', key='ondeck').all()
        ondeck_player_ids = map(lambda p: str(p.fb_uid), ondeck_players)
        if ondeck_player_ids != old_ondeck_player_ids:
            print "ondeck:",ondeck_player_ids
        old_ondeck_player_ids = ondeck_player_ids

        if (len(ondeck_players) >= settings.chat_min):
            create_chat (players = ondeck_players[0:settings.chat_min])

        gevent.sleep (1)

if __name__ == '__main__':
    #main = gevent.spawn(main_loop)
    #main.join()
    main_loop()
