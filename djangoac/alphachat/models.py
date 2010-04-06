from django.db import models

class Profile(models.Model):
    """Store information about the user specific to the game."""
    color = models.CharField(max_length = 5)
    wins = models.IntegerField()
    pic = models.URLField()
    fb_userid = models.IntegerField()
