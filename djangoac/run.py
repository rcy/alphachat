#!/usr/bin/python
from gevent import monkey; monkey.patch_all()
from gevent.wsgi import WSGIServer
import sys
import os
import traceback
from django.core.handlers.wsgi import WSGIHandler
from django.core.management import call_command
from django.core.signals import got_request_exception

sys.path.append('..')
os.environ['DJANGO_SETTINGS_MODULE'] = 'djangoac.settings'

def exception_printer(sender, **kwargs):
    traceback.print_exc()

got_request_exception.connect(exception_printer)

call_command('syncdb')
port=8000
print 'Serving on '+str(port)+'...'
WSGIServer(('', port), WSGIHandler()).serve_forever()

