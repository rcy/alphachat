util = {
  log: function(obj) { 
    typeof(console) != 'undefined' 
      && typeof(JSON) != 'undefined'
      && console.log(JSON.stringify(obj)); 
  },

  scrollDown: function() { 
    window.scrollBy(0, 100000000000000000); 
  }
};
