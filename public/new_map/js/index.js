/*global BMap*/
/*global BMAP_STATUS_SUCCESS*/
  
/*global geoHelper*/
/*global screenLockHelper*/

/*global EventSource*/

var DEBUG = false;
 
window.addEventListener('DOMContentLoaded', function() {
  var contentDiv = document.querySelector('#debugger');
  
  var debug = function(message) {
    if(DEBUG) {
      var d = document.createElement('div');
      
      d.innerHTML = message;
      
      contentDiv.appendChild(d);
      
      contentDiv.scrollTop = contentDiv.scrollHeight;
    }
  };
  
  if(DEBUG) {
    contentDiv.setAttribute('class', contentDiv.getAttribute('class') + ' debuggable');
      
    screenLockHelper.debug = debug;
    geoHelper.debug = debug;
  }
  
  var testMedia = function(mediaString) {
    var mm = window.matchMedia(mediaString);
    return mm.matches;
  }
  
  var map = new BMap.Map('map');
  var convertor = new BMap.Convertor();
  
  var nearbyIcon = new BMap.Icon("http://api.map.baidu.com/img/markers.png", new BMap.Size(23, 25), {  
      offset: new BMap.Size(10, 25),
      imageOffset: new BMap.Size(0, 0 - 10 * 25)
  }); 
  
  navigator.geolocation.getCurrentPosition(function(position) {
    convertor.translate([new BMap.Point(position.coords.longitude, position.coords.latitude)], 1, 5, function (data) {
			if(data.status === 0) {
				var bmapPoint = data.points[0];
				
				map.clearOverlays();
  
				var marker = new BMap.Marker(bmapPoint);
				
				map.addOverlay(marker);
				
        map.centerAndZoom(bmapPoint, 18);
			}
    });
  });
  
  var lastUpdate = new Date();
		
	var panMap = function(position) {
    var now = new Date();
    
    if(now - lastUpdate > 5000) {
      lastUpdate = now;
      
      debug('[PAN MAP] @ ' + now);
      
  		convertor.translate([new BMap.Point(position.coords.longitude, position.coords.latitude)], 1, 5, function (data) {
  			if(data.status === 0) {
  				var bmapPoint = data.points[0];
  				
  				debug('' + bmapPoint);
  				
  				map.clearOverlays();
  
  				var marker = new BMap.Marker(bmapPoint);
  				
  				map.addOverlay(marker);
  				
      		map.panTo(bmapPoint);
  			}
  		});
    }
	};
	
	var nearbyOverlays = [];
	
	var loadNearByTags = function(nearby) {
	  
	  for(var i = 0; i < nearbyOverlays.length; ++i) {
	    map.removeOverlay(nearbyOverlays[i]);
	  }
	  
	  nearbyOverlays = [];
	  
	  for(var n in nearby) {
	    var v = nearby[n];
	    
	    debug('>> n : ' + n + ', v : ' + JSON.stringify(v));
	    
	    convertor.translate([new BMap.Point(v.coordinates[0], v.coordinates[1])], 1, 5, function (data) {
  			if(data.status === 0) {
  				var bmapPoint = data.points[0];
  				
  				debug('' + bmapPoint);
  				
  				var marker = new BMap.Marker(bmapPoint, {icon: nearbyIcon});
  				
  				marker.addEventListener('click', function(){    
            //alert('>>' + n);
            var opts = {    
             width : 250,    
             height: 100,    
             title : 'Colleague'
            }
            var infoWindow = new BMap.InfoWindow(n, opts); 
            map.openInfoWindow(infoWindow, bmapPoint);  
          });
  				
  				map.addOverlay(marker);
  				
  				nearbyOverlays.push(marker);
  			}
  		});
	  }
	};

  screenLockHelper.onIntervalCheck = function() {
    //geoHelper.ping();
  };
  
  screenLockHelper.onScreenReopen = function() {
    debug('[REOPEN]');
    geoHelper.reconnect();
  };
  
  var watchID = null;
  
  geoHelper.onRemoteMessage = function(data) {
    //debug('-- REMOTE... --' + JSON.stringify(data));
    loadNearByTags(data);
  };
  
  geoHelper.onready = function() {
    var geoOption = {
      enableHighAccuracy: true, 
      maximumAge        : 0, 
      timeout           : 30000
    };

    var errorHandler = function(err) {
      debug(err.message);
    };
    
    var doomLoop = function() {
      if(watchID) {
        navigator.geolocation.clearWatch(watchID);
      }

      watchID = navigator.geolocation.watchPosition(function(position) {
        debug('POSITION : (' + position.coords.longitude + ', ' + position.coords.latitude + ')');
        geoHelper.sendPosition(position);
        panMap(position);
      }, function(err) {
        errorHandler(err);
        watchID = doomLoop();
      }, geoOption);
    };

    doomLoop();
  };
  
  //Send WebSocket URL...
  
  var url = ((location.protocol == 'https:') ? 'wss://' : 'ws://') + location.hostname + (location.port.length > 0 ? (':' + location.port) : '') + '/geo';
  
  debug('URL : ' + url);
  
  geoHelper.setURL(url);
  
  geoHelper.setUserInfo($('#userName').val(), $('#shuttleLine').val());
  
  geoHelper.start();
  
  window.addEventListener('online', function() {
    debug('[ONLINE]');
    geoHelper.reconnect();
  });
  
  window.addEventListener('offline', function() {
    debug('[OFFLINE]');
    geoHelper.stop();
  });
  
  // if(typeof(EventSource) !== 'undefined') {
  //   var sse = new EventSource("../sse");
            
  //   sse.onmessage = function(event) {
  //     debug('[message]');
  //     debug(event);
  //     document.querySelector('#d1').innerHTML += (event.data + '<br/>');
  //   };
  // }
}, false);