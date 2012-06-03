require({
  paths: {
    jquery: 'libs/jquery/jquery-1.7.1',
    underscore: 'libs/underscore/underscore.min',  // from https://github.com/amdjs
    backbone: 'libs/backbone/backbone.min', // from https://github.com/amdjs
    cs: 'cs',
    CoffeeScript: 'CoffeeScript'
  }
}, ['cs!csmain']);
