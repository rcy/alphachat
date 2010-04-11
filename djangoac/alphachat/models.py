from couchdbkit.ext.django.schema import *
from datetime import *

class Player(Document):
    creation_time = DateTimeProperty(default = datetime.utcnow)

    fb_uid = StringProperty()
    pic = StringProperty()

    # waiting_for_game
    state = StringProperty()

    color = StringProperty()
    room_id = StringProperty()

    def create(self, request):
        self.fb_uid = str(request.facebook.uid)
        self._id = 'player-'+self.fb_uid
        print 'info: creating new player', self._id
        self.pic = request.facebook.users.getInfo([request.facebook.uid],
                                                  ['pic_square'])[0]['pic_square']
        self.save()
        return self

class Room(Document):
    creation_time = DateTimeProperty(default = datetime.utcnow)

    # ids of the occupants [red, green, blue]
    players = ListProperty()

    # needs_players, chatting, judging, finished
    state = StringProperty()

class Message(Document):
    creation_time = DateTimeProperty(default = datetime.utcnow)

    # join, privmsg, like
    command = StringProperty(required = True)

    body = StringProperty(required = True)
    player_id = StringProperty(required = True)
    room_id = StringProperty(required = True)
