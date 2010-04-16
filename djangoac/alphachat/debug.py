import datetime

def log(msg):
    print 'log:',datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), msg
