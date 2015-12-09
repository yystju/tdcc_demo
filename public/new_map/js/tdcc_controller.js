/*global angular*/
/*global geoHelper*/

var app = angular.module('TDCCApp', []);
    
app.service('TDCCService', function($http, $q) {
  return {
    initModule: function($scope) {
      var deferred = $q.defer();
      
      $q.all([
        $http.get('../gallery/sessions.json'), 
        $http.get('../gallery/users.json')
      ]).then(function(results) {
        //console.dir(results);
        
        if(results && results.length > 0) {
          $scope.sessions = results[0].data; // sessions
          $scope.users = results[1].data; // users
        }
        
        deferred.resolve($scope.sessions, $scope.users);
      }, function(errors) {
        //console.dir(errors);
        deferred.reject(errors);
      }, function(updates) {
        //console.dir(updates);
        deferred.update(updates);
      });
      
      return deferred.promise;
    }
  };
});

app.controller('MainController', function($scope, $http, TDCCService) {
  TDCCService.initModule($scope).then(function(sessions, users) {
    // console.log('sessions := ' + JSON.stringify(sessions) + ', users := ' + JSON.stringify(users));
  });
  
  $scope.qrContent = '/qr?content=' + encodeURIComponent(location.href);
  $scope.pageURL = location.href;
  
  console.log($scope.qrContent);
  
  $scope.userInfo = null;
  
  $scope.refreshUserInfo = function() {
    if(!($scope.userInfo)) {
      var userInfo = window.localStorage.getItem('__userInfo__');
  
      if(userInfo) {
        userInfo = JSON.parse(userInfo);
      } else {
        userInfo = {
          userName: '',
          shuttleLine: '#1'
        };
      }
      
      $scope.userInfo = userInfo;
    }
  };
  
  $scope.updateUserInfo = function() {
    window.localStorage.setItem('__userInfo__', JSON.stringify($scope.userInfo));
    geoHelper.setUserInfo($('#userName').val(), $('#shuttleLine').val());
  };
  
  $scope.refreshUserInfo();
});