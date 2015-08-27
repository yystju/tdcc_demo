var offX = 10;
var offY = 10;

var stepX = 20;
var stepY = 20;

var N = 50;

var g = g || new Graph();

var nodes = null;

var startId = null;
var endId = null;


var StorageName = '__nodes';

$(document).ready(function() {
	var c1 = document.getElementById('c1');
	var ctx = c1.getContext('2d');
	
	var renderGrid = function() {
	    // ctx.strokeStyle = '#EEEEEE';
	    // for(var i = 0; i < N; ++i) {
	    //     ctx.moveTo(offX, offY + i * stepY);
		   // ctx.lineTo(offX + (N - 1) * stepX, offY + i * stepY);
	    // }
	    
	    // for(var i = 0; i < N; ++i) {
	    //     ctx.moveTo(offX + i * stepX, offY);
		   // ctx.lineTo(offX + i * stepX, offY + (N-1) * stepY);
	    // }
	    
	    // ctx.stroke();
	};
	
	var initNodes = function(n) {
		g = new Graph();
		
		delete nodes;
		nodes = null;
		startId = null;
		endId = null;
		
	    if(!n) {
            nodes = new Array(N);
    		
    		for(var i = 0; i < N; ++i) {
    			nodes[i] = new Array(N);
    			for(var j = 0; j < N; ++j) {
    				nodes[i][j] = {'x': stepX * i, 'y': stepY * j};
    				
    				g.addNode('(' + i + ',' + j + ')', nodes[i][j]);
    			}
    		}
	    } else {
	        nodes = n;
	        
	        for(var i = 0; i < N; ++i) {
    			for(var j = 0; j < N; ++j) {
    				if(nodes[i][j]) {
    					g.addNode('(' + i + ',' + j + ')', nodes[i][j]);
    				}
    			}
    		}
	    }
		
		for(var i = 1; i < N; ++i) {
			for(var j = 1; j < N; ++j) {
				if(nodes[i - 1][j] && nodes[i][j]) {
					g.addRelationship('(' + (i - 1) + ',' + j + ')', '(' + i + ',' + j + ')', 1);
					g.addRelationship('(' + i + ',' + j + ')', '(' + (i - 1) + ',' + j + ')', 1);
				}
				
				if(nodes[i][j - 1] && nodes[i][j]) {
					g.addRelationship('(' + i + ',' + (j - 1) + ')', '(' + i + ',' + j + ')', 1);
					g.addRelationship('(' + i + ',' + j + ')', '(' + i + ',' + (j - 1) + ')', 1);
				}
			}
		}  
	};
	
	var renderNodes = function() {
	    ctx.strokeStyle = '#000000';
	    for(var i = 1; i < N; ++i) {
			for(var j = 1; j < N; ++j) {
			    if(nodes[i - 1][j] && nodes[i][j]) {
					ctx.moveTo(offX + nodes[i-1][j]['x'], offY + nodes[i-1][j]['y']);
					ctx.lineTo(offX + nodes[i][j]['x'], offY + nodes[i][j]['y']);
				}
				
				if(nodes[i][j - 1] && nodes[i][j]) {
					ctx.moveTo(offX + nodes[i][j-1]['x'], offY + nodes[i][j-1]['y']);
					ctx.lineTo(offX + nodes[i][j]['x'], offY + nodes[i][j]['y']);
				}
			}
		}
		
		ctx.stroke();
		
		ctx.fillStyle="#000000";
		
		for(var i = 0; i < N; ++i) {
		    for(var j = 0; j < N; ++j) {
		        if(nodes[i][j] != undefined) {
		            if(startId == '(' + i + ',' + j + ')') {
		                ctx.fillStyle="#88FF00";
		            } else if(endId == '(' + i + ',' + j + ')') {
		                ctx.fillStyle="#00FF88";
		            } 
		            
        			ctx.beginPath();
        			ctx.arc(offX + nodes[i][j]['x'], offY + nodes[i][j]['y'], 5, 0, Math.PI*2, true);
        			ctx.closePath();
        			ctx.fill();
		        }
		    }
		}
	};
	
	var repaint = function() {
	    ctx.fillStyle = '#FFFFFF';
	    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.width);
	    
	    renderGrid();
    	renderNodes();
	};
	
	var txt = localStorage.getItem(StorageName);
	
	if(txt) {
	    nodes = JSON.parse(txt);
	}
	
	initNodes(nodes);
	
	repaint();
	
	var selectedList = [];
	
	$('#c1').click(function(evt) {
	    console.log('[click]');
	    
	    evt.preventDefault();
	    
	    var offsetX = evt.offsetX;
	    var offsetY = evt.offsetY;
	    
	    console.dir('offsetX := ' + offsetX + ', offsetY := ' + offsetY);
	    
	    var found = null;
	    
	    for(var i = 0; i < N; ++i) {
		    for(var j = 0; j < N; ++j) {
		        if(!nodes[i][j]) continue;
		        
		        var x = offX + nodes[i][j]['x'];
		        var y = offY + nodes[i][j]['y'];
		        
		        if(Math.sqrt((x - offsetX) * (x - offsetX) + (y - offsetY) * (y - offsetY)) < 5) { // in the circle.
		            found = {
		                'i': i,
		                'j': j,
		                'o': nodes[i][j],
		                'id': '(' + i + ',' + j + ')'
		            };
		            
		            break;
		        }
		    }
		    
		    if(found) {
		        break;
		    }
		}
		
		if(found) {
		    selectedList.push(found);
		    
		    ctx.fillStyle="#00FF00";
		
		    ctx.beginPath();
			ctx.arc(offX + found['o']['x'], offY + found['o']['y'], 5, 0, Math.PI*2, true);
			ctx.closePath();
			ctx.fill();
		}
	});
	
	var flag = true;
	
	$('#c1').dblclick(function(evt) {
	    console.log('[dblclick]');
	    
	    evt.preventDefault();
	    
	    var offsetX = evt.offsetX;
	    var offsetY = evt.offsetY;
	    
	    console.dir('offsetX := ' + offsetX + ', offsetY := ' + offsetY);
	    
	    var found = null;
	    
	    for(var i = 0; i < N; ++i) {
		    for(var j = 0; j < N; ++j) {
		        if(!nodes[i][j]) continue;
		        
		        var x = offX + nodes[i][j]['x'];
		        var y = offY + nodes[i][j]['y'];
		        
		        if(Math.sqrt((x - offsetX) * (x - offsetX) + (y - offsetY) * (y - offsetY)) < 5) { // in the circle.
		            found = {
		                'i': i,
		                'j': j,
		                'o': nodes[i][j],
		                'id': '(' + i + ',' + j + ')'
		            };
		            
		            break;
		        }
		    }
		    
		    if(found) {
		        break;
		    }
		}
		
		if(found) {
		    if(flag) { // start
		        startId = found['id'];
		    } else { // end
		        endId = found['id'];
		    }
		    
		    flag = !flag;
		}
	});
	
	$('#btn1').click(function() {
	    for(var i = 0; i < selectedList.length; ++i) {
	        g.removeNode(selectedList[i]['id']);
	        nodes[selectedList[i]['i']][selectedList[i]['j']] = undefined;
	        delete nodes[selectedList[i]['i']][selectedList[i]['j']];
	    }
	    
	    selectedList.splice(0, selectedList.length);
	    
	    repaint();
	});
	
	$('#btn2').click(function() {
	    if(startId && endId) {
    		var result = g.findPath(startId, endId);
    		
    		//repaint();
    		
    		for(var i = 0; i < result.length; ++i) {
    			ctx.fillStyle="#FF0000";
    			ctx.beginPath();
    			ctx.arc(offX + result[i]['x'], offY + result[i]['y'], 5, 0, Math.PI*2, true);
    			ctx.closePath();
    			ctx.fill();
    		}
	    }
	});
	
	$('#btn3').click(function() {
		selectedList.splice(0, selectedList.length);
		startId = null;
		endId = null;
	    initNodes(nodes);
	    repaint();
	});

    $('#btn4').click(function() {
	    localStorage.setItem(StorageName, JSON.stringify(nodes));
	});
	
	var dataType = 'Text'; //'plain/text';
	
	document.querySelector('#c1').setAttribute('draggable', true);
	
	document.querySelector('#c1').addEventListener('dragstart', function(evt) {
		console.log('[dragstart]');
		evt.dataTransfer.setData(dataType, JSON.stringify({'N': N, 'nodes': nodes}));
		evt.dataTransfer.dropEffect = 'copy';
		//evt.preventDefault();
	}, false);
	
	document.querySelector('#c1').addEventListener('dragenter', function(evt) {
		console.log('[dragenter]');
		evt.dataTransfer.dropEffect = 'copy';
		evt.preventDefault();
	}, false);
	
	document.querySelector('#c1').addEventListener('dragleave', function(evt) {
		console.log('[dragleave]');
		evt.preventDefault();
	}, false);
	
	// document.querySelector('#c1').addEventListener('drag', function(evt) {
	// 	console.log('[drag]');
	// 	evt.dataTransfer.dropEffect = 'copy';
	// 	evt.preventDefault();
	// }, false);
	
	document.querySelector('#c1').addEventListener('dragover', function(evt) {
		console.log('[dragover]');
		evt.dataTransfer.dropEffect = 'copy';
		evt.preventDefault();
	}, false);
	
	document.querySelector('#c1').addEventListener('drop', function(evt) {
		console.log('[drop]');
		evt.preventDefault();
		evt.stopPropagation();
		
		var dataText = evt.dataTransfer.getData(dataType);
		
		if(dataText) {
			var data = JSON.parse(dataText);
			
			if(data) {
				if(N == data.N) {
					nodes = data.nodes;
					initNodes(nodes);
					repaint();
				}
			}
		}
	}, false);
});
