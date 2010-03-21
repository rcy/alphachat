from alphachat.chat.models import ChatMessage
from django.http import HttpResponse
from time import sleep

def send(request, text):
    newmsg = ChatMessage(msg = text);
    newmsg.save()
    return HttpResponse("received: " + text + "\n");

def since(request, msgid):
    """Get messages newer than lastid.""" 
    sleep (10)
    return HttpResponse("since\n");
