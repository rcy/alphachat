from couchdbkit.ext.django.schema import Document
from alphachat.schema import PlayerDoc, RoomDoc, MessageDoc

class Player(Document, PlayerDoc):
    def create(self):
        self.save()
        return self

class Room(Document, RoomDoc):
    pass

class Message(Document, MessageDoc):
    pass
