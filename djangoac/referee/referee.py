#!/usr/bin/python
import datetime
from couchdbkit import Server, Document
from couchdbkit import StringProperty, ListProperty
import gevent
import gevent.monkey
from time import sleep
import sys, os
sys.path.append('..')
from alphachat.schema import PlayerDoc, RoomDoc, MessageDoc
import referee_settings as settings
from alphachat.event import wait_for_change, get_seq

gevent.monkey.patch_all()

s = Server()
db = s.get_or_create_db("alphachat")

class Player(PlayerDoc): pass
Player.set_db(db)
class Room(RoomDoc): pass
Room.set_db(db)
class Message(MessageDoc): pass
Message.set_db(db)

colors = ['red','green','blue']

def debug(msg):
    print datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), msg

def create_chat(players):
    debug ('creating a room for %s' % players)

    # create the room
    room = Room(state = 'chat')
    room.save()
    debug ('created room: %s' % room._id)

    since = get_seq(db)

    # mark the players as chatting in the room
    for player, color in zip(players, colors):
        debug( 'moving %s to chat in %s' % (player.fb_uid, room['_id']))
        player.state = 'chat'
        player.room_id = room['_id']
        player.color = color
        player.join = False
        player.save()

    # spawn game timer sequence
    g = gevent.spawn(run_game, room._id, players, since)

def run_game(room_id, players, since):
    jobs = []
    for player in players:
        debug ("WAITING FOR PLAYER TO JOIN: %s" % player.color)
        jobs.append(gevent.spawn(wait_for_change, player.get_db(), player, since))
    gevent.joinall(jobs)


    # todo: this hack is to refresh the players from the database
    # after the wait_for_change, push this into that routine, or find
    # a cleaner way to do this.
    new_players = []
    for p in players:
        new_players.append(p.get(p._id))
    players = new_players


    not_joined = filter(lambda p: not p.join, players)
    debug("NOTJOINED:%s"%not_joined)
    if not_joined:
        # cancel the game
        for p in not_joined:
            Message().Info(room_id, 
                           "%s didnt join, cancelling game." % p.color).save()
        return
        
    debug ("ALL PLAYERS JOINED STARTING GAME")
    game_seconds = settings.chat_seconds
    vote_seconds = settings.vote_seconds

    # game time
    Message().State(room_id, "chat", game_seconds).save()

    debug ("sleeping for %d seconds..." % game_seconds)
    gevent.sleep (game_seconds)
    debug ("sleeping for %d seconds...done." % game_seconds)

    Message().State(room_id, "chat", 0).save()
    debug( "room %s: chat time is up!" %(room_id,))

    # voting time
    Message().State(room_id, "vote", vote_seconds).save()
    gevent.sleep (vote_seconds)
    Message().State(room_id, "vote", 0).save()
    debug ("room %s: vote time is up!" %(room_id,))

    # display winner time
    Message().State(room_id, "results", 0).save()

def main_loop():
    debug ("Referee started.  Waiting for players in state == 'ondeck'")

    old_lobby_player_ids = None
    old_ondeck_player_ids = None
    
    while True: 
        lobby_players = Player.view('alphachat/player__state', key='lobby').all()
        lobby_player_ids = map(lambda p: str(p.fb_uid), lobby_players)
        if lobby_player_ids != old_lobby_player_ids:
            debug ("lobby: %s" % lobby_player_ids)
        old_lobby_player_ids = lobby_player_ids

        ondeck_players = Player.view('alphachat/player__state', key='ondeck').all()
        ondeck_player_ids = map(lambda p: str(p.fb_uid), ondeck_players)
        if ondeck_player_ids != old_ondeck_player_ids:
            debug ("ondeck: %s" % ondeck_player_ids)
        old_ondeck_player_ids = ondeck_player_ids

        if (len(ondeck_players) >= settings.chat_min):
            create_chat (players = ondeck_players[0:settings.chat_min])
            
        #debug (".")
        gevent.sleep (1)

if __name__ == '__main__':
    #main = gevent.spawn(main_loop)
    #main.join()
    main_loop()
