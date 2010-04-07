from django.db import models

class Profile(models.Model):
    """Store information about the user specific to the game."""
    wins = models.IntegerField()
    pic = models.URLField()
    fbuid = models.IntegerField()
