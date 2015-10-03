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
				
				deferred.resolve(results[0].data, results[1].data);
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
	
	$scope.getUser = function(vcnId) {
		console.log('vcnId := ' + vcnId);
		var usr = null;
		if($scope.users && $scope.users.length) {
			$scope.users.forEach(function (element, index, array) {
				if(element.vcnId == vcnId) {
					usr = element;
					return false;
				}
			});
		}
		return usr;
	};
	
	$scope.addUser = function(vcnId, name, email) {
		$scope.users.push({'vcnId': vcnId, 'displayName': name, 'email': email});
	};
});

$(document).ready(function() {
	/*
	 * jQuery way of latch.
	 */
	// var p = $.getJSON('./users.json');
	// var q = $.getJSON('./sessions.json');
	
	// $.when(p, q).then(function(userResult, sessionResult) {
	// 	console.dir(userResult);
	// 	console.dir(sessionResult);
		
	// 	console.log('sessions := ' + JSON.stringify(sessionResult[0]));
	// 	console.log('   users := ' + JSON.stringify(userResult[0]));
	// });
	
	$('#editorDialog').on('hidden.bs.modal', function (e) {
		console.log('form := ' + $('#editorPropForm').serialize());
	});
	
	$('#editorDialog').on('show.bs.modal', function (e) {
		var key = $(e.relatedTarget).data('key');
		
		if(key) {
			var name = $(e.relatedTarget).data('name');
			var type = $(e.relatedTarget).data('type');
			var owner = $(e.relatedTarget).data('owner');
			
			$('#editorSessionName').val(name);
			$('#editorSessionType').val(type);
			$('#editorSessionOwner').val(owner);
		} else {
			$('#editorSessionName').val('');
			$('#editorSessionType').val('');
			$('#editorSessionOwner').val('');
		}
	});
	
	$('#qrCodeDialog').on('show.bs.modal', function (e) {
		var url = $(e.relatedTarget).data('url');
		
		if(url) {
			var qrURL = 'http://www.qr-code-generator.com/phpqrcode/getCode.php?cht=qr&chl='+encodeURIComponent(url)+'&chs=180x180&choe=UTF-8&chld=L|0'; 
		
			$('#qrCodeDialogQRImage').attr('src', qrURL).attr('alt', url);
		}
	});
});
