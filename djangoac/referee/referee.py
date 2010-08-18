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
import referee_settings as settings
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

def refresh_list(lst):
    # This hack is to refresh documents from the database after they
    # might have been changed elsewhere.  Useful after calling
    # wait_for_change.  todo: maybe this should be pushed into
    # wait_for_change somehow?
    return map(lambda e: e.get(e._id), lst)

def create_chat(players):
    log ('creating a room for %s' % players)

    # create the room
    room = Room(state = 'chat')
    room.save()
    log ('created room: %s' % room._id)

    since = get_seq(db)

    # mark the players as chatting in the room
    for player, color in zip(players, colors):
        log('moving %s to chat in %s' % (player._id, room['_id']))
        player.state = 'chat'
        player.room_id = room['_id']
        player.color = color

        # TODO: remove this debugging special case handling:
        if len(players) == 1:
            # vote for ourselves
            player.vote_color = player.color
        else:
            player.vote_color = random.choice(filter(lambda x: x!=color, colors)[:len(players)-1])

        player.join = False
        player.save()

    # spawn game timer sequence
    g = gevent.spawn(run_game, room._id, players, since)

def run_game(room_id, players, since):
    jobs = []
    for player in players:
        log ("WAITING FOR PLAYER TO JOIN: %s" % player.color)
        jobs.append(gevent.spawn(wait_for_change, player, since))
    gevent.joinall(jobs)

    players = refresh_list(players)

    not_joined = filter(lambda p: not p.join, players)
    log("NOTJOINED:%s"%not_joined)
    if not_joined:
        # cancel the game
        for p in not_joined:
            Message().Info(room_id, "%s didnt join, cancelling game." % p.color).save()
        for p in players:
            p.state = 'endgame'
            p.save()
        return
        
    log ("ALL PLAYERS JOINED STARTING GAME")
    game_seconds = settings.chat_seconds
    vote_seconds = settings.vote_seconds

    # game time
    Message().Info(room_id, "Chat for %s seconds"%game_seconds).save();
    Message().State(room_id, "chat", game_seconds).save()
    gevent.sleep (game_seconds)
    Message().State(room_id, "chat", 0).save()
    log ("room %s: chat time is up!" %(room_id,))

    # voting time
    players = refresh_list(players)
    for p in players:
        log("marking player %s as state vote" % p._id)
        p.state = 'vote'
        p.save()
    Message().State(room_id, "vote", vote_seconds).save()
    Message().Info(room_id, "Chat period is over!").save();
    gevent.sleep(1)
    Message().Info(room_id, "You have %s seconds to choose the player on the left that you liked the best"%vote_seconds).save();
    gevent.sleep (vote_seconds)
    Message().State(room_id, "vote", 0).save()
    log ("room %s: vote time is up!" %(room_id,))

    # count votes
    players = refresh_list(players)
    by_color = {}
    for p in players:
        by_color[p.color] = p

    score = {'red':0, 'green':0, 'blue':0}
    for p in players:
        voter = p
        choice = by_color[p.vote_color]
        score[p.vote_color] += 1000

        log("vote: %s for %s" % (voter.color, choice.color))
        Message().Info(room_id, "%s voted for %s"%(voter.color, choice.color)).save()
        # create the vote document
        Vote(room_id = room_id, player_id = voter._id, choice_id = choice._id).save()

    score = "[POINTS] Red: %s, Green: %s, Blue: %s"%(score['red'],
                                                     score['green'],
                                                     score['blue'])
    log("score: %s"%score)
    Message().Info(room_id, score).save()
    Message().State(room_id, "results", 0).save()
    Message().Info(room_id, "Game is over!").save();

    # update player states
    for p in players:
        p.state = 'endgame'
        p.save()

def main_loop():
    log ("Referee started.  Waiting for players in state == 'ondeck'")

    old_lobby_player_ids = None
    old_ondeck_player_ids = None
    
    while True: 
        lobby_players = Player.view('alphachat/player__state', key='lobby').all()
        lobby_player_ids = map(lambda p: str(p._id), lobby_players)
        if lobby_player_ids != old_lobby_player_ids:
            log ("lobby: %s" % lobby_player_ids)
        old_lobby_player_ids = lobby_player_ids

        ondeck_players = Player.view('alphachat/player__state', key='ondeck').all()
        ondeck_player_ids = map(lambda p: str(p._id), ondeck_players)
        if ondeck_player_ids != old_ondeck_player_ids:
            log ("ondeck: %s" % ondeck_player_ids)
        old_ondeck_player_ids = ondeck_player_ids

        if (len(ondeck_players) >= settings.chat_min):
            create_chat (players = ondeck_players[0:settings.chat_min])
            
        #log (".")
        gevent.sleep (1)

if __name__ == '__main__':
    main_loop()
