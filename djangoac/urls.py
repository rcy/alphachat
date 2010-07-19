from django.conf.urls.defaults import *
from djangoac import settings

urlpatterns = patterns('djangoac.alphachat.views',
                       ('^$', 'index'),
                       ('^(\w+.html)', 'html_content'),

                       ('^a/get_since/$', 'get_since'),
                       ('^a/lobby/find_room/$', 'lobby_find_room'),
                       ('^a/room/chatters_html/(.+)/$', 'room_chatters_html'),
                       ('^a/room/post/(.+)/$', 'message_new'),
                       ('^a/room/msgs/(.+)/(\d+)/$', 'message_updates'),

                       # todo debugging, remove:
                       ('^facebook/canvas/a/lobby/wait/$', 'lobby_wait'),
                       ('^facebook/canvas/test/foo/$', 'test_foo'),
                       )

urlpatterns += patterns('django.views.static',
    (r'^%s(?P<path>.*)$' % settings.MEDIA_URL.lstrip('/'),
      'serve', {
      'document_root': settings.MEDIA_ROOT,
      'show_indexes': True }))
