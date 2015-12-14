(function(scope) {
    scope['geoHelper'] = scope['geoHelper'] || {};
    
    var gh = scope['geoHelper'];
    
    gh.onready = null; //event handler...
    gh.onRemoteMessage = null; //event handler...
    
    gh.debug = function(msg) {
      if(console) console.log(msg);
    };
    
    //Init GEO helper...
    var worker = new Worker('./js/GeoWorker.js');
    
    worker.command = function(cmd, payload) {//This is not a good way... but a working way...
      worker.postMessage({'action': cmd, 'payload': payload});
    };
    
    worker.onmessage = function(evt) {//MESSAGE PUMP
      if(evt.data && evt.data.action) {//NORMAL ACTIONS
        switch(evt.data.action) {
        case 'debug':
          gh.debug('[GEO] ' + evt.data.msg);
          break;
        case 'id':
          //gh.debug('[GEO] id : ' + id);
          //TODO: Add Update ID event here.
          break;
        case 'remoteMessage':
          //gh.debug('[GEO] remoteMessage...');
          
          if(gh.onRemoteMessage) {
            gh.onRemoteMessage(evt.data.payload);
          }
          break;
        case 'ready':
          //gh.debug('[GEO] ready...');
          
          if(gh.onready) {
            gh.onready(evt.data.payload);
          }
          break;
        default:
          //gh.debug('[GEO] UNKNOWN ACTION : ' + evt.data.action + ', payload : ' + evt.data.payload);
          break;
        }
      }
    };
    
    gh.reconnect = function() {
      worker.command('reconnect', null);
    };
    
    gh.start = function() {
      worker.command('start', null);
    };
    
    gh.stop = function() {
      worker.command('stop', null);
      // worker.terminate();
    };
    
    gh.ping = function() {
      worker.command('ping', null);
    };
    
    gh.setURL = function(url) {
      worker.command('url', url);
    };
    
    gh.setUserInfo = function(userName, shuttleLine) {
      worker.command('userInfo', {
        'userName': userName, 'shuttleLine': shuttleLine
      });
    };
    
    gh.sendPosition = function(position) {
      worker.command('position', {
        'coordinates': [position.coords.longitude, position.coords.latitude], 
        'timestamp': position.timestamp, 
        'accuracy': position.coords.accuracy,
        'altitude': position.coords.altitude,
        'altitudeAccuracy': position.coords.altitudeAccuracy,
        'heading': position.coords.heading,
        'speed': position.coords.speed
      });
    };
})(this);
