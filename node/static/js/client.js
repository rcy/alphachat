socket = new io.Socket('localhost');
socket.connect();
socket.on('connect', function(){
  console.log('connect');
});
socket.on('message', function(data){
  console.log('connect');
});
socket.send('some data');
