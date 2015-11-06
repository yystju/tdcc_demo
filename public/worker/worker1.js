/**
 * worker1.js
 * UPDATE HISTORY:
 * -- 1 -- Nov 1, 2015, by QUAN
 * -- 2 -- Nov 1, 2015, by QUAN
 */
var debug = function(msg) {
    postMessage({'action': 'debug', 'msg': msg});
}

debug('[START]');

var txt = '<<';
var count = 0;

onmessage = function(evt) {
    txt = evt.data;
    count = 0;
};

var ihandler = setInterval(function() {
    debug('' + txt + ' : ' + count);
    
    count++;
    
    postMessage({'action': 'work', 'data': [count + 1, count + 2, count + 3, count + 4]});
    
    try {
        var s = new WebSocket('wss://prj01-yystju.c9.io/geo', ['geoinfo']);
        
        s.onmessage = function (evt) {
            debug('[MESSAGE] := ' + JSON.stringify(evt.data));
        };
        
        s.onopen = function () {
            debug('[OPEN] STATUS := ' + JSON.stringify(s));
            
            s.send(JSON.stringify({'action': 'ping'}));
            
            s.close();
        };
    } catch (e) {
        debug('ERROR:' + e.message);
    }
}, 1000);

debug('[FINISHED]');
