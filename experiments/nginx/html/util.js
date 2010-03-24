function query_string() {
    var assoc = new Array();
    var qs = unescape(location.search.substring(1));
    var keyValues = qs.split('&');
    for (var i in keyValues) {
        var key = keyValues[i].split('=');
        assoc[key[0]] = key[1];
    }
    return assoc;
}
