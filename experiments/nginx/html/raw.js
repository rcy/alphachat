$(function() 
  {
      getmsg(false);
  });

function getmsg(oldreq) 
{
    var req = new XMLHttpRequest();
    req.open ('GET', '/activity?id=xyzzy', true);
    if (oldreq)
    {
        req.setRequestHeader("If-Modified-Since", oldreq.getResponseHeader("Last-Modified"));
        req.setRequestHeader("If-None-Match", oldreq.getResponseHeader("Etag"));

        display ('Last-Modified: ' + oldreq.getResponseHeader("Last-Modified"));
        display ('Etag: ' + oldreq.getResponseHeader("Etag"));
    }

    try 
    {
        req.onreadystatechange = function (aEvt) 
        {  
            switch (req.readyState) 
            {
            case 0:
                //display ("<b>UNINITIALIZED</b>");
                break;
            case 1:
                //display ("<b>LOADING</b>");
                break;
            case 2:
                //display ("<b>LOADED</b>");
                //display (req.status);
                //display (req.getAllResponseHeaders());
                break;
            case 3:
                //display ("<b>INTERACTIVE</b>");
                break;
            case 4:
                //display ("<b>COMPLETED</b>");
                display('responseText: ' + req.responseText);
                req.abort();
                getmsg(req);
                break;
            }  
        }
    }
    catch(e)
    {
        alert('Caught Exception: ' + e.description);
    }

    display ("<b>SEND</b>");
    req.send(null);
}

function display(msg)
{
    $('#box').append(msg);
    $('#box').append('<br>');
}
