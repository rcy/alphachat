from datetime import *
from couchdbkit import *

class BaseDoc(Document):
    creation_time = DateTimeProperty(default = datetime.utcnow)

class PlayerDoc(BaseDoc):
    fb_uid = StringProperty()
    pic = StringProperty()

    # lobby, ondeck, chat
    state = StringProperty()

    # red, green, blue
    color = StringProperty()

    room_id = StringProperty()

class RoomDoc(BaseDoc):
    players = ListProperty()
    state = StringProperty()

class MessageDoc(BaseDoc):
    # join, privmsg, like
    room_id = StringProperty(required = True)
    command = StringProperty(required = True)
    body = StringProperty(required = True)

    player_id = StringProperty(required = False)
    color = StringProperty(required = False)

    def privmsg(self, room_id, player_id, message):
        # TODO: make sure player is in room, do other validation
        self.room_id = room_id
        self.player_id = player_id
        self.color = self.get(player_id).color
        self.command = 'privmsg'
        self.body = message
        return self

    def info(self, room_id, message):
        self.room_id = room_id
        self.command = 'info'
        self.body = message
        return self

    def time(self, room_id, seconds):
        self.room_id = room_id
        self.command = 'time'
        self.body = str(seconds)
        return self
