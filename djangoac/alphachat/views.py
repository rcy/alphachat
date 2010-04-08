# this thing busts on epiphany, looks related to:
# http://code.google.com/p/pyfacebook/issues/detail?id=130
import uuid
import simplejson
from time import time, sleep
from django.shortcuts import render_to_response
from django.template.loader import render_to_string
from django.template import RequestContext
from django.http import HttpResponse
from gevent.event import Event
from gevent import Greenlet
from djangoac import settings


import facebook.djangofb as facebook

from alphachat.session import Session
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

class Lobby(object):
    def __init__(self):
        self.enough_chatters_event = Event()
        self.chatters = []
        self.room = None

    def find_room(self, request):
        "Returns a room_id, or false.  Long polling."
        uid = request.facebook.uid

        # search the existing rooms to see if user is already a member
        # TODO: this is an expensive lazy hack, store things
        # differently so we dont have to walk the room list every time
        # someone enters the lobby
        for id_,room in chatrooms.items():
            if uid in room.chatters:
                print "WARNING: %s alreading chattin in %s" % (uid, id_)
                return json_response(id_)

        print 'chatter entered lobby #', uid
        self.chatters.append(uid)

        if len(self.chatters) < num_chatters:
            print 'queuing a chatter'
            self.enough_chatters_event.wait(1)

            # see if we timed out
            if len(self.chatters) < num_chatters:
                print 'timed out chatter #', uid
                self.chatters.remove(uid)
                return json_response(False)
        else:
            print 'we have enough chatters now'
            # the last chatter sets up the room
            self.room = ChatRoom(self.chatters)
            self.chatters = []
            # push the others through
            self.enough_chatters_event.set()
            self.enough_chatters_event.clear()

        return json_response(self.room.id)

chatrooms = {}
class ChatRoom(object):
    def __init__(self, chatters):
        self.messages = []
        self.new_message_event = Event()
        self.chatters = chatters
        self.id = str(uuid.uuid4())
        self.msg_count = 0
        chatrooms[self.id] = self
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

    def get_pic(self, request):
        return request.facebook.users.getInfo([request.facebook.uid], 
                                              ['pic_square'])[0]['pic_square']

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
        uid = request.facebook.uid
        body = request.POST['body']

        self.msg_count += 1

        print "message_new: [%d] %s" % (self.msg_count, body)
        msg_obj = {'id':self.msg_count,
                   'body': body,
                   'html': render_to_string('message.html',
                                            {'color': self.my_color(uid),
                                             'id':self.msg_count,
                                             'body': body})}
        # TODO: push the msg_obj into the database here
        self.messages.append(msg_obj)
        self.new_message_event.set()
        self.new_message_event.clear()
        return json_response(msg_obj)

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
            
        return json_response({'messages': new_messages,
                              'time_up': self.time_up})

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
    return render_to_response('index.html', {}, RequestContext(request))

@facebook.require_login()
def html_content(request, page):
    html = render_to_string(page, {}, RequestContext(request))
    return json_response({'html':html})

################
# lobby view wrappers
################
lobby = Lobby()

@facebook.require_login()
def lobby_find_room(request): 
    return lobby.find_room(request)

################
# chat view wrappers
################
@facebook.require_login()
def room_chatters_html(request, roomid):
    #room = fbs.get(request,'room')
    room = chatrooms[roomid]
    return room.chatters_html(request)
    
@facebook.require_login()
def message_updates(request, roomid, last):
    room = chatrooms[roomid]
    print ">>> updates"
    #room = fbs.get(request,'room')
    retval = room.message_updates(request, int(last))
    print "<<< updates"
    return retval

@facebook.require_login()
def message_new(request, roomid):
    print ">>> new"
    #room = fbs.get(request,'room')
    room = chatrooms[roomid]
    retval = room.message_new(request)
    print "<<< new"
    return retval

################
# debugging
################
@facebook.require_login()
def test_foo(request):
    fbs.set(request, 'foo', 'bar')
    print fbs.get(request, 'foo')
    print fbs.get(request, 'undef')

    return HttpResponse(True)
