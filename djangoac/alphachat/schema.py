from datetime import *
from couchdbkit import *

class BaseDoc(Document):
    creation_time = DateTimeProperty(default = datetime.utcnow)

class PlayerDoc(BaseDoc):
    email = StringProperty()
    password = StringProperty()

    pic = StringProperty()

    # lobby, ondeck, chat
    state = StringProperty()

    # red, green, blue
    color = StringProperty()

    room_id = StringProperty()

class RoomDoc(BaseDoc):
    players = ListProperty()
    state = StringProperty()

class VoteDoc(BaseDoc):
    room_id = StringProperty(required = True)
    player_id = StringProperty(required = True)
    choice_id = StringProperty(required = True)

class MessageDoc(BaseDoc):
    # join, privmsg, like
    room_id = StringProperty(required = True)
    command = StringProperty(required = True)
    player_id = StringProperty(required = False)

    def Join(self, room_id, player_id):
        self.command = 'join'
        self.room_id = room_id
        self.player_id = player_id
        self.color = self.get(player_id).color
        return self

    def Chat(self, room_id, player_id, message):
        self.command = 'privmsg'
        self.room_id = room_id
        self.player_id = player_id
        self.color = self.get(player_id).color
        self.body = message
        return self

    def Info(self, room_id, message):
        self.command = 'info'
        self.room_id = room_id
        self.body = message
        return self

    def State(self, room_id, state, seconds):
        self.command = 'state'
        self.room_id = room_id
        self.state = state
        self.seconds = seconds
        return self
