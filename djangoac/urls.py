from django.conf.urls.defaults import *
from djangoac import settings

urlpatterns = patterns('djangoac.alphachat.views',
                       ('^facebook/canvas/$', 'main'),

                       ('^a/message/new$', 'message_new'),
                       ('^a/message/updates$', 'message_updates'),
                       ('^a/lobby/wait$', 'lobby_wait'),

                       # todo debugging, remove:
                       ('^facebook/canvas/a/lobby/wait$', 'lobby_wait'),
                       ('^facebook/canvas/test/foo$', 'test_foo'),
                       )

urlpatterns += patterns('django.views.static',
    (r'^%s(?P<path>.*)$' % settings.MEDIA_URL.lstrip('/'),
      'serve', {
      'document_root': settings.MEDIA_ROOT,
      'show_indexes': True }))
