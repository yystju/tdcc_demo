(function(scope) {
    scope['screenLockHelper'] = scope['screenLockHelper'] || {};
    
    var sh = scope['screenLockHelper'];
    
    sh.debug = function(msg) {
      if(console) console.log(msg);
    };
    
    sh.onIntervalCheck = null; //Event Place Holder.
    sh.onScreenReopen = null; //Event Place Holder.
    
    sh.debug('>>[ScreenLockHelper]');
    
    var worker = new Worker('./js/ScreenLockWorker.js');
    
    worker.command = function(cmd, payload) {//This is not a good way... but a working way...
      worker.postMessage({'action': cmd, 'payload': payload});
    };

    worker.onmessage = function(evt) {//MESSAGE PUMP
      if(evt.data && evt.data.action) {//NORMAL ACTIONS
        switch(evt.data.action) {
        case 'screen_reopen':
          sh.debug('[screen_reopen] ' + evt.data.payload);
          
          if(sh.onScreenReopen) sh.onScreenReopen(evt.data.payload);
          
          break;
        case 'interval_check':
          sh.debug('[interval_check] ' + evt.data.payload);
          
          if(sh.onIntervalCheck) sh.onIntervalCheck(evt.data.payload);
          
          break;
        default:
          sh.debug('[SCREEN LOCK] UNKNOWN ACTION : ' + evt.data.action + ', payload : ' + evt.data.payload);
          break;
        }
      }
    };
    
    sh.stop = function() {
      worker.command('stop', null);
      // worker.terminate();
    };
    sh.debug('<<[ScreenLockHelper]');
})(this);
