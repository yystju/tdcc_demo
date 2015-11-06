(function(scope) {
    var debug = function(msg) {
      scope.postMessage({'action': 'debug', 'msg': msg});
    }
    
    var command = function(action, payload) {
      scope.postMessage({'action': action, 'payload': payload});
    }
    
    debug('>>[ScreenLockWorker]');
    
    var technical = technical || {};
    
    var t = technical;
    
    t.SMPL_INTVL = 1000;
    t.LOCK_SCREEN_THREADHOLD = 5000;
    t.lastUpdateDate = new Date();
    
    t.onScreenReopen = function(interval) {
      command('screen_reopen', interval);
    };
    
    t.onIntervalCheck = function() {
      command('interval_check', null);
    };
    
    var i = setInterval(function() {
      var now = new Date();
      var interval = now - t.lastUpdateDate;
      if(interval> t.LOCK_SCREEN_THREADHOLD) {
        t.onScreenReopen(interval);
      }
      
      t.lastUpdateDate = now;
      
      t.onIntervalCheck();
    }, t.SMPL_INTVL);

    scope.onmessage = function(evt) {//MESSSAGE PUMP
        //debug('msg : ' + evt.data);
        
        if(evt.data && evt.data.action) {//NORMAL ACTIONS
          switch(evt.data.action) {
          case 'stop':
              clearInterval(i);
              break;
          default:
            debug('UNKNOWN ACTION : ' + evt.data.action + ', payload : ' + evt.data);
            break;
          }
        }
    };
    
    debug('<<[ScreenLockWorker]');
})(this);
