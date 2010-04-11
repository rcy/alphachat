# this thing busts on epiphany, looks related to:
# http://code.google.com/p/pyfacebook/issues/detail?id=130
import uuid
import simplejson
import datetime
from time import time, sleep
from django.shortcuts import render_to_response
from django.template.loader import render_to_string
from django.template import RequestContext
from django.http import HttpResponse
from djangoac import settings

import facebook.djangofb as facebook

from alphachat.models import Player, Room, Message
from alphachat.session import Session
from alphachat.event import wait_for_change, wait_for_changes

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

@facebook.require_login()
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

    # set our state, and go to sleep until someone wakes us up
    if player.state != 'ondeck':
        player.state = 'ondeck'
        player.save()

    updated_player = wait_for_change(player.get_db(), player)
    # TODO: http://dpaste.com/181858/ aka ../exp/class.py
    if updated_player:
        player = updated_player
        print 'player:', player, 'changed'
        if player['state'] == 'chat':
            return json_response(player['room_id'])
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

    print 'player:',player
    print 'other_players:',other_players
    
    html = render_to_string('chatters.html',
                            { 'my_color': player.color,
                              'other_colors': map(lambda p: p.color, other_players),
                              'my_pic': get_pic(request) },
                            RequestContext(request))
    return json_response({'html':html})
    
@facebook.require_login()
def message_updates(request, room_id, since):
    # TODO: verify that this user is in this room
    print "waiting for messages on:", room_id
    docs, since = wait_for_changes(get_db('alphachat'),
                                   doc_type="Message", 
                                   by_key="room_id", by_value=room_id, 
                                   since=since)

    msgs = map(lambda m: {'html': render_to_string('message.html', 
                                                   {'color': m['color'], 
                                                    'body': m['body']})},
               docs)
    
    return json_response({'since': since, 
                          'messages': msgs})

@facebook.require_login()
def message_new(request, room_id):
    player = get_player(request)

    if request.method == 'POST':
        data = request.POST
        message = Message(room_id = room_id,
                          player_id = player._id,
                          color = player['color'],
                          command = data['command'],
                          body = data['body'])
        message.save()

    return json_response(True)

################
# debugging
################
def test_foo(request):
    g_event.wakeup('dummyid')
    return HttpResponse(True)
