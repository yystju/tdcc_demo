

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

var localStream = null;

function changeTopic(isBackward) {
	var topics = document.querySelectorAll('.topic');
	
	for(var i = 0; i < topics.length; ++i) {
		var t = topics[i];
		
		if(t.className.indexOf('template') != -1) {
			continue;
		}
		
		if(t.className.indexOf('invisible') == -1) {
			t.className += ' invisible';
			
			var j = (isBackward ? i > 0 : i < topics.length - 1) ? (isBackward ? i - 1 : i + 1) : (isBackward ? topics.length - 1 : 0);
			
			topics[j].className = topics[j].className.replace('invisible', '');
			
			break;
		}
	}
}

/**
 *  handler: void onPaneVisibilityChanged(Node element, bool isVisible);
 */
function setPaneVisible(selector, isVisible, handler) {
	var elements = document.querySelectorAll(selector);
	
	for(var i = 0; i < elements.length; ++i) {
		var e = elements[i];
		
		if(isVisible) {
			if(e.className.indexOf('invisible') >= 0) {
				e.className = e.className.replace('invisible', '');
			}
		} else {
			if(e.className.indexOf('invisible') == -1) {
				e.className += ' invisible';
			}
		}
		if(handler) {
			try {
				handler(e, isVisible);
			} catch(err) {
				console.log(err);
			}
		}
	}
}

function togglePaneVisible(selector) {
	var elements = document.querySelectorAll(selector);
	
	for(var i = 0; i < elements.length; ++i) {
		var e = elements[i];
		
		if(e.className.indexOf('invisible') == -1) {
			e.className += ' invisible';
		} else {
			e.className = e.className.replace('invisible', '');
		}
	}
}

/*global MediaStreamTrack*/
function onTakePictureLoad(element) {
	if(window.MediaStreamTrack) {
		MediaStreamTrack.getSources(function(sources) {
			var hasVideoDevice = false;
			
			for (var i = 0; i < sources.length; ++i) {
				var source = sources[i];
				
				if(source.kind  == 'video') {
					hasVideoDevice = true;
					break;
				}
			}
			
			if(hasVideoDevice) {
				setPaneVisible('#caputrePicPane', true);
				setPaneVisible('#uploadPicPane', false);
			} else {
				setPaneVisible('#caputrePicPane', false);
				setPaneVisible('#uploadPicPane', true);
			}
		});
	} else {
		setPaneVisible('#caputrePicPane', false);
		setPaneVisible('#uploadPicPane', true);
	}
}

function onTakePictureUnLoad(element) {
}

function onCapturePicPaneLoad(element) {
	if(window.AudioContext) {
		navigator.getUserMedia({
			audio: false, 
			video: {
				mandatory: {
					minWidth: 640,
					minHeight: 480,
					maxWidth: 640,
					maxHeight: 480
				}
			}
		}, function(stream) {
			localStream = stream;
			
			var v = document.querySelector('#pictureVideo');
			if (window.URL) {
				v.src = window.URL.createObjectURL(stream);
			} else {
				v.src = stream;
			}
			v.play();
		}, function(err) {
			console.log(err);
			if('DevicesNotFoundError' == err.name) {
				alert('NEED TO CHANGE TO THE UPLOAD MODE.');
			}
		});
	}
}

function onCapturePicPaneUnLoad(element) {
	if(localStream) {
		var tks = localStream.getVideoTracks();
		for(var i = 0; i < tks.length; ++i) {
			tks[i].stop();
		}
	}
	var v = document.querySelector('#pictureVideo');
	v.pause();
	v.src = '';
}

function _f(s) {
	return eval(s);
};

function _eval (that, s) {
	return _f.apply(that, [s]);
}

function _replaceAllInString(s, r, d) {
	var tmp = s;
	var idx = -1;
	
	while(true) {
		if(-1 == (idx = tmp.indexOf(r))) {
			break;
		}
		
		tmp = tmp.replace(r, d);
	}
	
	return tmp;
}

/**
 * processor - void processor(Number id, Object scope, String html);
 */
function createNodeByTemplate(selector, scopes, processor) {
	var templates = document.querySelectorAll(selector);
	
	var id = 0;
	
	for(var i = 0; i < templates.length; ++i) {
		for(var j = 0; j < scopes.length; ++j) {
			var html = templates[i].innerHTML;
			
			var scope = scopes[j];
			
			var idx = 0;
			
			while(idx > -1 && idx < html.length) {
				var idx = html.indexOf('%%{', idx);
				
				if(idx <= -1) break;
				
				var end = html.indexOf('}%%', idx);
				
				var script = html.substring(idx + 3, end); /* 3 == '%%{'.length; */
				
				var obj = _eval(scope, script);
				
				html = _replaceAllInString(html, '%%{' + script + '}%%', obj);
				
				idx = end;
			}
			
			if(processor) processor(id, scope, html);
			
			++id;
		}
	}
}

window.addEventListener('load', function() {
	createNodeByTemplate('.template', [{
		'id': 'topic1',
		'topicTitle': 'Zencoding introduction.',
		'showImageURL': './imgs/zen_coding.png',
		'topicDescriptionCiteURL': 'https://code.google.com/p/zen-coding/',
		'topicDescription': 'Zen Coding is an editor plugin for high-speed HTML, XML, XSL (or any other structured code format) coding and editing. The core of this plugin is a powerful abbreviation engine which allows you to expand expressions—similar to CSS selectors—into HTML code.',
		'topicDescriptionCiteURL': 'https://code.google.com/p/zen-coding/',
		'topicDescriptionCiteName': 'zen-coding home',
		'topicReference': [{
			'url': 'http://www.smashingmagazine.com/2009/11/21/zen-coding-a-new-way-to-write-html-code/',
			'text': 'Zen Coding: A Speedy Way To Write HTML/CSS Code'
		}, {
			'url': 'http://www.google.com.hk',
			'text': 'Google'
		}],
		'topicOwner': {
			'imgURL': './imgs/quan_portrait.png',
			'fullName': 'Quan Shi',
			'emailAddress': 'quan.shi@volvo.com'
		},
		'topicEvaluator': {
			'imgURL': './imgs/alex_portrait.png',
			'fullName': 'Alex Liu',
			'emailAddress': 'alex.liu@volvo.com'
		},
		'topicFollowers': [{
			'emailAddress': 'eric.zhang@consultant.volvo.com',
			'imgURL': './imgs/eric_portrait.png',
			'fullName': 'Eric Zhang'
		}]
	},{
		'id': 'topic2',
		'topicTitle': 'NVS Integration Library Introduction.',
		'showImageURL': './imgs/nvs_integration.png',
		'topicDescriptionCiteURL': 'https://teamplace.volvo.com/sites/volvoit-dotNET/WebPartLib/NVSWebPage.aspx',
		'topicDescription': 'NVS Integration Library is ...',
		'topicDescriptionCiteURL': 'https://teamplace.volvo.com/sites/volvoit-dotNET/WebPartLib/NVSWebPage.aspx',
		'topicDescriptionCiteName': 'NVS home',
		'topicReference': [{
			'url': 'https://teamplace.volvo.com/sites/volvoit-dotNET/WebPartLib/NVSWebPage.aspx',
			'text': 'NVS'
		}],
		'topicOwner': {
			'imgURL': './imgs/alex_portrait.png',
			'fullName': 'Alex Liu',
			'emailAddress': 'alex.liu@volvo.com'
		},
		'topicEvaluator': {
			'emailAddress': 'eric.zhang@consultant.volvo.com',
			'imgURL': './imgs/eric_portrait.png',
			'fullName': 'Eric Zhang'
		},
		'topicFollowers': [{
			'imgURL': './imgs/quan_portrait.png',
			'fullName': 'Quan Shi',
			'emailAddress': 'quan.shi@volvo.com'
		}]
	}], function(id, scope, html) {
		var parent = document.querySelector('.paneWrapper');
		var child = document.querySelector('.rightScrollPane');
		
		var node = document.createElement('div');
		node.id = scope.id;
		node.innerHTML = html;
		
		if(id != 0) {
			node.querySelector('.topic').className = node.querySelector('.topic').className  + ' invisible';
		}
		
		parent.insertBefore(node, child);
	});

	document.querySelector('#openAnchor').addEventListener('click', function() {
		setPaneVisible('#floatPane', true);
		setPaneVisible('#floatPaneBackground', true);
	}, false);
	
	document.querySelector('#floatPaneBackground').addEventListener('click', function() {
		setPaneVisible('#floatPaneBackground', false);
		setPaneVisible('#floatPane', false);
	}, false);
	
	document.querySelector('#createPortraitAnchor').addEventListener('click', function() {
		setPaneVisible('#takPicturePaneBackground', true);
		setPaneVisible('#takePicturePane', true, onTakePictureLoad);
	}, false);
	
	document.querySelector('#takPicturePaneBackground').addEventListener('click', function() {
		setPaneVisible('#takePicturePane', false);
		setPaneVisible('#takPicturePaneBackground', false);
	}, false);
	
	document.querySelector('#capturePicAnchor').addEventListener('click', function() {
		setPaneVisible('#capturePicturePaneBackground', true);
		setPaneVisible('#capturePicturePane', true, onCapturePicPaneLoad);
	}, false);
	
	document.querySelector('#capturePicturePaneBackground').addEventListener('click', function() {
		setPaneVisible('#capturePicturePane', false, onCapturePicPaneUnLoad);
		setPaneVisible('#capturePicturePaneBackground', false);
	}, false);
	
	document.querySelector('.leftScrollPane').addEventListener('click', function() {
		changeTopic(true);
	}, false);
	
	document.querySelector('.rightScrollPane').addEventListener('click', function() {
		changeTopic();
	}, false);
	
	document.querySelector('#pictureVideo').addEventListener('click', function() {
		var canvas = document.querySelector('#pictureCanvas');
		var video = document.querySelector('#pictureVideo');
		
		var vw = parseInt(document.defaultView.getComputedStyle(video, null).width);
		var vh = parseInt(document.defaultView.getComputedStyle(video, null).height);
		
		var cw = canvas.clientWidth;
		var ch = canvas.clientHeight;
		
		canvas.width = cw;
		canvas.height = ch;
		
		var sx = (vw - cw) / 2;
		var sy = (vh - ch) / 2;
		
		canvas.getContext('2d').drawImage(video, sx, sy, cw, ch, 0, 0, cw, ch);
		
		setPaneVisible('#capturePicturePane', false, onCapturePicPaneUnLoad);
		setPaneVisible('#capturePicturePaneBackground', false);
	}, false);
	
	var pictureCanvas = document.querySelector('#pictureCanvas');
	
	pictureCanvas.addEventListener('dragstart',function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
	},false);
	
	pictureCanvas.addEventListener('dragover', function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
		evt.target.className = ('dragover' == evt.type) ? 'draggedover' : '';
	}, false);
	
	pictureCanvas.addEventListener('dragleave', function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
		evt.target.className = ('dragleave' == evt.type) ? '' : 'draggedover';
	}, false);
	
	var processPictureFile = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
		evt.target.className = ('drop' == evt.type) ? '' : evt.target.className;
		
		var files = evt.target.files || evt.dataTransfer.files;
		
		for(var i = 0; i < files.length; ++i) {
			var file = files[i];
			
			var reader = new FileReader();
			
			reader.onload = function(e) {
				//var buffer = e.target.result;
				//console.log(buffer.byteLength);
				
				//var byteArray = new Uint8ClampedArray(buffer);
				
				var url = e.target.result;
				
				console.log('url := ' + url);
				
				var img = new Image;
				img.onload = function() {
					var ctx = pictureCanvas.getContext('2d');
					ctx.drawImage(img, 0, 0, pictureCanvas.width, pictureCanvas.height);
				};
				img.src = url;
			}
			//reader.readAsArrayBuffer(file);
			
			reader.readAsDataURL(file);
		}
	};
	
	document.querySelector('#uploadPicPane').addEventListener('change', processPictureFile, false);
	pictureCanvas.addEventListener('drop', processPictureFile, false);
	
	pictureCanvas.addEventListener('mousedown', function(evt) {
		//console.log(evt);
	}, false);
	
	pictureCanvas.addEventListener('mousemove', function(evt) {
		//console.log(evt);
	}, false);
	
	pictureCanvas.addEventListener('mouseup', function(evt) {
		//console.log(evt);
	}, false);
	
	pictureCanvas.addEventListener('mouseout', function(evt) {
		//console.log(evt);
	}, false);
	
	pictureCanvas.addEventListener('touchstart', function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
		console.log(evt.changedTouches[0]);
	}, false);
	
	pictureCanvas.addEventListener('touchmove', function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
		console.log(evt.changedTouches[0]);
	}, false);
	
	pictureCanvas.addEventListener('touchend', function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		
		console.log(evt.changedTouches[0]);
	}, false);
}, false);
