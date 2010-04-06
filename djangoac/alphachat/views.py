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

num_chatters = 2            # always 3, but hack it down to test
colors = ['red','green','blue']

def create_message(from_, body):
    data = {'id': str(uuid.uuid4()), 'from': from_, 'body': body}
    data['html'] = render_to_string('message.html', 
                                    dictionary={'message': data, 'color':'green'})
    return data


def json_response(value, **kwargs):
    kwargs.setdefault('content_type', 'text/javascript; charset=UTF-8')
    return HttpResponse(simplejson.dumps(value), **kwargs)

# todo: rewrite this handrolled session system, or extend the django
# session framework once i have a better idea whats going on
session = {}

class Lobby(object):
    def __init__(self):
        self.enough_chatters_event = Event()
        self.reset()

    def reset(self):
        self.room = None
        self.chatters = []

    def wait(self, request):
        key = request.facebook.session_key

        self.chatters.append(key)

        if len(self.chatters) < num_chatters:
            print 'queuing a chatter #', len(self.chatters)
            self.enough_chatters_event.wait(1)

            # see if we timed out
            if len(self.chatters) < num_chatters:
                print 'chatter timed out'
                self.chatters.remove(key)
                return json_response(False)
        else:
            print 'we have enough chatters now'
            # the last chatter sets up the room
            self.room = ChatRoom(self.chatters)
            # push the others through
            self.enough_chatters_event.set()
            self.enough_chatters_event.clear()

        print 'a got here'
        # all chatters run through this code
        session[key]['room'] = self.room
        session[key]['foo'] = 'bar'
        print 'set ',key,'up in',self.room
        my_color = self.room.my_color(key)
        other_colors = self.room.other_colors(key)
        print 'c got here'
        chat_attrs = { 'my_color':my_color,
                       #'my_pic':Profile.objects.get(pic==),
                       'other_colors':other_colors,
                       }
        print 'd got here'
        html = render_to_string('status.html',
                                chat_attrs,
                                context_instance = RequestContext(request))
        print 'e got here'
        return json_response({'success':True,
                              'status_html':html})

chatrooms = {}
class ChatRoom(object):
    def __init__(self, chatters):
        self.messages = []
        self.new_message_event = Event()
        self.chatters = chatters
        self.id = str(uuid.uuid4())
        chatrooms[self.id] = self
        
    def my_color(self, key):
        return colors[self.chatters.index(key)]

    def other_colors(self, key):
        other_colors = colors[:]
        other_colors.remove(self.my_color(key))
        return other_colors

    def message_new(self, request):
        key = request.facebook.session_key
        body = request.POST['body']
        msg_obj = {'body': body,
                   'html': render_to_string('message.html',
                                            {'color': self.my_color(key),
                                             'body': body})}
        self.messages.append(msg_obj)
        self.new_message_event.set()
        self.new_message_event.clear()
        return json_response(msg_obj)

    def message_updates(self, request):
        key = request.facebook.session_key
        cursor = session[key]['cursor']
        print 'cursor:', cursor

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
        session[key]['cursor'] = len(self.messages)
        return json_response({'messages': new_messages})

################
# top level views
################
@facebook.require_login()
def main(request): 
    print "*** we should only come here on first page view or reload"
    # this is the main landing page
    key = request.facebook.session_key

    # create a profile if one doesnt exist
    #fb = request.facebook
    #p = Profile(uid = fb.uid)

    # set up a session
    session[key] = { 'room': None,
                     'cursor': 0,
                     'foo': 'nothing'}

    return render_to_response('alphachat.html', {}, RequestContext(request))

################
# lobby view wrappers
################
lobby = Lobby()

@facebook.require_login()
def lobby_wait(request): 
    return lobby.wait(request)

################
# chat view wrappers
################
@facebook.require_login()
def message_updates(request):
    # lookup the users session id
    key = request.facebook.session_key
    print 'key',key
    # find out which chat it is a part of
    room = session[key]['room']
    print 'room', room
    foo = session[key]['foo']
    print 'foo',foo
    # dispatch to that chatroom
    #return json_response(room.id)
    return room.message_updates(request)

@facebook.require_login()
def message_new(request):
    key = request.facebook.session_key
    s = session[key]
    room = s['room']
    return room.message_new(request)


@facebook.require_login()
def test_foo(request):
    key = request.facebook.session_key
    print "test_foo:", key
    if key == None:
        raise KeyError
    return HttpResponse(key)

