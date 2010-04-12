from couchdbkit.ext.django.schema import Document
from alphachat.schema import PlayerDoc, RoomDoc, MessageDoc

class Player(Document, PlayerDoc):
    def create(self, request):
        self.fb_uid = str(request.facebook.uid)
        self._id = 'player-'+self.fb_uid
        print 'info: creating new player', self._id
        self.pic = request.facebook.users.getInfo([request.facebook.uid],
                                                  ['pic_square'])[0]['pic_square']
        self.save()
        return self

class Room(Document, RoomDoc):
    pass

class Message(Document, MessageDoc):
    pass
