# this thing busts on epiphany, looks related to:
# http://code.google.com/p/pyfacebook/issues/detail?id=130
import uuid
import simplejson
from time import sleep
from django.shortcuts import render_to_response
from django.template.loader import render_to_string
from django.http import HttpResponse
from gevent.event import Event
from djangoac import settings
from django.template import RequestContext

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
        self.reset()

    def reset(self):
        self.room = None
        self.chatters = []

    def find_room(self, request):
        "Returns a room_id, or false.  Long polling."
        uid = request.facebook.uid

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
            # push the others through
            self.enough_chatters_event.set()
            self.enough_chatters_event.clear()

        # all chatters run through this code
        fbs.set(request, 'room', self.room)

        return json_response(self.room.id)

chatrooms = {}
class ChatRoom(object):
    def __init__(self, chatters):
        self.messages = []
        self.new_message_event = Event()
        self.chatters = chatters
        self.id = str(uuid.uuid4())
        chatrooms[self.id] = self
        
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
        fbs.set(request, 'cursor', 0)#TODO: HACK: this should be in a real JOIN handler
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
        print "message_new:" + body
        msg_obj = {'body': body,
                   'html': render_to_string('message.html',
                                            {'color': self.my_color(uid),
                                             'body': body})}
        self.messages.append(msg_obj)
        self.new_message_event.set()
        self.new_message_event.clear()
        return json_response(msg_obj)

    def message_updates(self, request):
        cursor = fbs.get(request, 'cursor')
        print 'message length:',len(self.messages),'cursor:', cursor

        # the cursor cannot be ahead of the message queue
        assert len(self.messages) >= cursor

        if cursor == len(self.messages):
            print 'waiting'
            self.new_message_event.wait(100)

        # check again to see if we timed out, or a new message came in
        if cursor == len(self.messages):
            new_messages = []
        else:
            new_messages = self.messages[cursor:]
            
        # update the cursor and return the messages
        fbs.set(request, 'cursor', len(self.messages))
        return json_response({'messages': new_messages})

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
def message_updates(request, roomid):
    room = chatrooms[roomid]
    print ">>> updates"
    #room = fbs.get(request,'room')
    retval = room.message_updates(request)
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
