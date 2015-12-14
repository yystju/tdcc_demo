(function(scope) {
    var debug = function(msg) {
      scope.postMessage({'action': 'debug', 'msg': msg});
    }
    
    var command = function(action, payload) {
      scope.postMessage({'action': action, 'payload': payload});
    }

    debug('>>[GeoWorker]');
    
    var business = business || {};
    
    var b = business;
    
    b.url = b.url || null; //URL
    b.id = b.id || null;   //The transaction id.
    b.s = b.s || null;     //WebSocket Object.
    
    b.isReady = false;
    
    //debug('business properties : ' + JSON.stringify(b));
    
    b._startConnection = function(isReconnect) {
      try {
        b.isReady = false;
        
        b.s = new WebSocket(b.url, ['geoinfo']);

        b.s.onmessage = function(evt) {
          var data = evt.data;
          
          if(data) {
            data = JSON.parse(data);
            
            if(!isReconnect && data.id) {
              b.id = data.id;
              //debug('id := ' + b.id);
              postMessage({'action': 'id', 'payload': b.id});
            } else if(!isReconnect && data) {
              //debug('[RESPONSE] : ' + JSON.stringify(data));
              postMessage({'action': 'remoteMessage', 'payload': data});
            }
          }
        };
        
        b.s.onopen = function (evt) {
          //debug('[OPEN]' + evt);
          b.isReady = true;
          command('ready', null);
        };
        
        b.s.onerror = function (error) {
          //debug('[ERROR]' + error);
          b._stopConnection();
        };
        
        b.s.onclose = function (evt) {
          //debug('[CLOSE]' + evt);
          b.isReady = false;
        };
      } catch (e) {
        debug(JSON.stringify(e));
      }
    };
    
    b._stopConnection = function() {
      if(b.s) {
          try {
            b.s.close();
            b.s = null;
            b.isReady = false;
          } catch (e) {
            debug(JSON.stringify(e));
          }
      }
    };
    
    b.startUp = function() {
      b._stopConnection();
      b._startConnection();
    };
    
    b.shutdown = function() {
      b._stopConnection();
    };
    
    b.ping = function() {
      if(b.isReady) {
        b.s.send(JSON.stringify({'action': 'ping'}));
      }
    };
    
    b.upload = function(position) {
      var data = JSON.stringify({'action': 'data', 'payload': {'id': b.id, 'userInfo': {'userName': b.userName, 'shuttleLine': b.shuttleLine},'position': {'type': 'Point', 'coordinates': position.coordinates}, 'clientDate': new Date(position.timestamp)}});
      
      debug('UPLOAD : ' + data);
      
      if(b.isReady) {
        b.s.send(data);
      }
    };
    
    b.reconnect = function() {
      b._startConnection(true);
    };
    
    scope.onmessage = function(evt) {//MESSSAGE PUMP
        //debug('msg : ' + evt.data);
        
        if(evt.data && evt.data.action) {//NORMAL ACTIONS
          switch(evt.data.action) {
          case 'userInfo':
            b.userName = evt.data.payload.userName;
            b.shuttleLine = evt.data.payload.shuttleLine;
            //debug('userName has been set to : ' + business.userName);
            //debug('shuttleLine has been set to : ' + business.shuttleLine);
            break;
          case 'url':
              b.url = evt.data.payload;
              //debug('url has been set to : ' + business.url);
            break;
          case 'start':
              //debug('ACTION : START');
              b.startUp();
            break;
          case 'stop':
              //debug('ACTION : STOP');
              b.shutdown();
            break;
          case 'ping':
              //debug('ACTION : PING');
              b.ping();
            break;
          case 'reconnect':
              //debug('ACTION : ONLINE');
              b.reconnect();
            break;
          case 'position':
              //debug('ACTION : POSITION');
              var position = evt.data.payload;
              b.upload(position);
            break;
          default:
            //debug('UNKNOWN ACTION : ' + evt.data.action + ', payload : ' + evt.data);
            break;
          }
        }
    };
    
    debug('<<[GeoWorker]');
})(this);
