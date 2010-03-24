var me = String.fromCharCode(65 + Math.round(Math.random() * 25));
var channel = query_string().channel;
var global_last_xhr = null;
var global_counter = 0;

$(function () {
        $('#chatform').submit(sendmsg);
        getmsg();
});

function display(msg)
{
    $('#box').append(msg);
    $('#box').append('<br>');

    if (msg == 0)
        global_counter=0;
    else 
    {
        global_counter++;
        if (global_counter != msg) 
        {
            //alert('fail');
            global_counter = msg;
        }
    }

    //$('#counter').html(global_counter)
}

function getmsg(last_xhr)
{
    last_xhr = global_last_xhr;
    $.ajax({ url: '/activity?id=' + channel, 
             cache: false,
             async: true,
             beforeSend: function(xhr) {
                 // using the data from the last request, prepare the
                 // headers to ask for subsequent messages
                 if (last_xhr) {
                     xhr.setRequestHeader("If-Modified-Since", 
                                          last_xhr.getResponseHeader("Last-Modified"));
                     xhr.setRequestHeader("If-None-Match", 
                                          last_xhr.getResponseHeader("Etag"));
                 }
             },
             complete: function(xhr, status) {
             },
             dataType: "text",
             success: getmsg_cb,
             error: error_cb
           });
    $('#status').html('online: ' + channel);
}

function getmsg_cb(data, s, xhr) {
    display(data);
    $('#events').append(xhr.getAllResponseHeaders());

    var div = $("#box")[0];
    // certain browsers have a bug such that scrollHeight is too small
    // when content does not fill the client area of the element
    var scrollHeight = Math.max(div.scrollHeight, div.clientHeight);
    div.scrollTop = scrollHeight - div.clientHeight;

    $('#status').html('got message');

    global_last_xhr = xhr;
    setTimeout('getmsg()', 0);
}

function sendmsg(event)
{
    $.ajax({ type: 'POST',
             url: '/publish?id=' + channel, 
             success: sendmsg_cb,
             cache: false,
             data: me + ": " + $("#chat").val()
           });

    $("#chat").val('')

    event.preventDefault();
    return false;
}

function sendmsg_cb(data, s, xhr) 
{
//    $('#events').html(xhr.getAllResponseHeaders());
}

function error_cb(xhr, status, error)
{
    $('#box').append("ERROR: " + xhr)
}
