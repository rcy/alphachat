import uuid
import simplejson
import datetime
from time import time
from django.shortcuts import render_to_response
from django.template.loader import render_to_string
from django.template import RequestContext
from django.http import HttpResponse
from djangoac import settings

import facebook.djangofb as facebook

from alphachat.models import Player, Room, Message
from alphachat.session import Session
from alphachat.event import wait_for_change, wait_for_changes, get_seq
from alphachat.debug import log

from couchdbkit import Consumer
from couchdbkit.ext.django.loading import get_db

def json_response(value, **kwargs):
    kwargs.setdefault('content_type', 'text/javascript; charset=UTF-8')
    return HttpResponse(simplejson.dumps(value), **kwargs)

def get_pic(request):
    return request.facebook.users.getInfo([request.facebook.uid], 
                                          ['pic_square'])[0]['pic_square']

################
# top level views
################
@facebook.require_login()
def index(request): 
    print "***"
    print "*"
    print "* landing page"
    print "*"
    print "***"
    fb_uid = str(request.facebook.uid)
    assert fb_uid

    # get or create player
    result = Player.view('alphachat/player__fb_uid', key=fb_uid)
    if result.count() == 1:
        player = result.first()
    else:
        player = Player().create(request)
    player.state = 'lobby'
    player.save()

    return render_to_response('index.html', RequestContext(request))

#@facebook.require_login()
def html_content(request, page):
    html = render_to_string(page, {}, RequestContext(request))
    return json_response({'html':html})

def get_player(request):
    fb_uid = str(request.facebook.uid)
    player = Player.view('alphachat/player__fb_uid', key=fb_uid).one()
    return player

@facebook.require_login()
def lobby_find_room(request):
    """
    Mark player as available for chat
    """
    player = get_player(request)

    since = get_seq(player.get_db())

    # set our state, and go to sleep until someone wakes us up
    if player.state != 'ondeck':
        player.state = 'ondeck'
        player.save()

    updated_player = wait_for_change(player.get_db(), player, since)
    # TODO: http://dpaste.com/181858/ aka ../exp/class.py
    if updated_player:
        player = updated_player
        log('player: %s changed' % player)
        if player['state'] == 'chat':
            return json_response({'room_id': player['room_id'],
                                  'color': player['color'],
                                  'since': get_seq(get_db('alphachat'))})
    else:
        # no room for you
        player.state = 'lobby'
        player.save()
        return json_response(False)

@facebook.require_login()
def room_chatters_html(request, room_id):
    player = get_player(request)
    other_players = filter(lambda p: p._id != player._id,
                           Player.view('alphachat/player__room_id', key=room_id).all())

    log('player: %s'%player)
    log('other_players: %s'%other_players)
    
    html = render_to_string('chatters.html',
                            { 'my_color': player.color,
                              'other_colors': map(lambda p: p.color, other_players),
                              'my_pic': get_pic(request) },
                            RequestContext(request))
    return json_response({'html':html})
    
def scrub_message(message):
    """remove any private data from message for client consumption"""
    return message

@facebook.require_login()
def message_updates(request, room_id, since):
    # TODO: verify that this user is in this room
    log("waiting for messages on: %s" % room_id)
    docs, since = wait_for_changes(get_db('alphachat'),
                                   doc_type="Message", 
                                   by_key="room_id", by_value=room_id, 
                                   since=since)

    # TODO: process messages one by one by command type.  maybe filter
    # some out for return to the client, ie dont send back their own
    # messages, certain system messages, etc
    #msgs = filter(message_is_public, 
    msgs = map(scrub_message, docs)

    return json_response({'since': since, 
                          'messages': msgs})

@facebook.require_login()
def message_new(request, room_id):
    # TODO: make sure player is in room, do other validation.
    player = get_player(request)

    if request.method == 'POST':
        data = request.POST
        log('new_message: %s'%request.POST)
        if data['command'] == 'join':
            Message().Join(room_id, player._id).save()
            player.join = True
            player.save()
        else:
            Message().Chat(room_id, player._id, data['body']).save()

    return json_response(True)

################
# debugging
################
def test_foo(request):
    g_event.wakeup('dummyid')
    return HttpResponse(True)
