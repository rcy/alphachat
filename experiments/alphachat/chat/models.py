from django.db import models

class ChatMessage(models.Model):
    msg = models.CharField(max_length = 256);
    
    def __unicode__(self):
        return "msg"
