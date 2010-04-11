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

fbs = Session();

num_chatters = 1            # always 3, but hack it down to test
colors = ['red','green','blue']

def create_message(from_, body):
    data = {'id': str(uuid.uuid4()), 'from': from_, 'body': body}
    data['html'] = render_to_string('message.html', 
                                    dictionary={'message': data, 'color':'green'})
    return data


def json_response(value, **kwargs):
    kwargs.setdefault('content_type', 'text/javascript; charset=UTF-8')
    return HttpResponse(simplejson.dumps(value), **kwargs)


chatrooms = {}
class ChatRoom:
    def __init__(self, chatters):
        self.message_cache = []
        self.chatters = chatters

        self.new_message_event = Event()
        self.id = str(uuid.uuid4())
        self.timekeeper = Greenlet.spawn(self.alarm)

    def alarm(self):
        self.time_up = False
        print "STARTED TIMER: %s" % (self.id)
        sleep(30)
        print "TIME UP: %s" % (self.id)
        self.time_up = True
        self.new_message_event.set()
        self.new_message_event.clear()
        
    def my_color(self, uid):
        return colors[self.chatters.index(uid)]

    def other_colors(self, uid):
        other_colors = colors[:]
        other_colors.remove(self.my_color(uid))
        return other_colors

    ################
    # handlers
    ################
    def chatters_html(self, request):
        "Returns the sidebar html for the room's chatters."
        uid = request.facebook.uid
        print 'ROOM INFO:', self.chatters, 'uid:', uid

        my_color = self.my_color(uid)
        other_colors = self.other_colors(uid)
        chat_attrs = { 'my_color': my_color,
                       'my_pic': self.get_pic(request),
                       'other_colors': other_colors,
                       }
        html = render_to_string('chatters.html',
                                chat_attrs,
                                context_instance = RequestContext(request))
        return json_response({'html':html})


    def message_new(self, request):
        fbuid = request.facebook.uid

        msg = Message(self, fbuid, request.POST)

        self.store(msg)

        if msg.cmd == 'JOIN':
            retval = self.message_join(self, request)
        elif cmd == 'PRIVMSG':
            retval = self.message_privmsg(self, request)
        else:
            raise(BadCommand)
        return json_response(retval)

    def cmd_join(self, request):
        return True

    def message_privmsg(self, request):
        uid = request.facebook.uid
        body = request.POST['body']

        self.msg_count += 1

        print "message_new: [%d] %s" % (self.msg_count, body)

        html = render_to_string('message.html', {'color': color, 
                                                 'id': count, 
                                                 'body': body})

        msg_obj = {'id': self.msg_count,
                   'uid':uid,
                   'color': self.my_color(uid),
                   'room_id': self.room.id,
                   'time': time.time(),
                   'body': body}

        self.messages.add(msg_obj)

        # push the other clients through
        self.new_message_event.set()
        self.new_message_event.clear()

        return {'success': True, 
                obj: {'html': html,
                      'msg': self.scrub(msg_obj)}}

    def message_updates(self, request, last):
        "Return a list of messages for this room since LAST."
        print 'updates: %s in %s after %d' % (request.facebook.uid, self.id, last)

        num_messages = len(self.messages)

        if last > num_messages:
            print "WARNING: last(%d) is too far ahead of num_messages(%d)" % (last, num_messages)
            last = num_messages

        if last == num_messages:
            self.new_message_event.wait(4)

        # we test again to see if we timed out, or a new message came in
        if last == num_messages:
            new_messages = []
        else:
            new_messages = self.messages[last:]
            
        return {'success': True, 
                'messages': new_messages, 
                'time_up': self.time_up}


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

################
# debugging
################
def test_foo(request):
    g_event.wakeup('dummyid')
    return HttpResponse(True)

################
# chat view wrappers
################
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
