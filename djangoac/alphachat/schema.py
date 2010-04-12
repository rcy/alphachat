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
    command = StringProperty(required = True)

    body = StringProperty(required = True)
    player_id = StringProperty(required = False)
    room_id = StringProperty(required = True)
    color = StringProperty(required = True)
