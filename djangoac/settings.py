from os.path import dirname, join, abspath
__dir__ = dirname(abspath(__file__))

DEBUG = True
TEMPLATE_DEBUG = DEBUG
ADMINS = ()
MANAGERS = ADMINS
DATABASE_ENGINE = 'sqlite3'
DATABASE_NAME = 'alphachat.db'
DATABASE_USER = ''
DATABASE_PASSWORD = ''
DATABASE_HOST = ''
DATABASE_PORT = ''
TIME_ZONE = 'America/Chicago'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = True
MEDIA_ROOT = join(__dir__, 'static')
MEDIA_URL = '/media/'
SECRET_KEY = 'nv8(yg*&1-lon-8i-3jcs0y!01+rem*54051^5xt#^tzujdj!c'
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.load_template_source',
    'django.template.loaders.app_directories.load_template_source',
)
MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'facebook.djangofb.FacebookMiddleware',
)
FACEBOOK_API_KEY='e56094f7af8d288bffab65c184f1a18b'
FACEBOOK_SECRET_KEY='8d67994a8f2ad424ec53c9943c2fff79'
ROOT_URLCONF = 'djangoac.urls'
TEMPLATE_DIRS = (
    join(__dir__, 'templates')
)
INSTALLED_APPS = (
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'djangoac.alphachat',
    'couchdbkit.ext.django'
)
COUCHDB_DATABASES = (
    ('djangoac.alphachat', 'http://192.168.13.108:5984/alphachat'), )
