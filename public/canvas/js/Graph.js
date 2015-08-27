var Graph = Graph || (function() {
	return function() {
		this._nodes = {};
		this._relationships = [];
	};
})();

Graph.prototype.addNode = function(id, o) {
	if(!this._nodes[id]) {
		this._nodes[id] = o;
	}
};

Graph.prototype.addRelationship = function(s, d, w) {
	if(this._nodes[s] && this._nodes[d]) {
		var existed = false;
		for(var i = 0; i < this._relationships.length; ++i) {
			if(this._relationships[i]['s'] == s && this._relationships[i]['d'] == d) {
				existed = true;
				break;
			}
		}
		
		if(!existed) {
			this._relationships.push({'s': s, 'd': d, 'w': w});
		}
	}
};

Graph.prototype.removeNode = function(id) {
	if(this._nodes[id]) {
		for(var i = 0; i < this._relationships.length; ++i) {
			if(this._relationships[i]['s'] == id || this._relationships[i]['d'] == id) {
				this._relationships.splice(i, 1);
			}
		}
		
		this._nodes[id] = undefined;
		delete this._nodes[id];
	}
};

Graph.prototype._getToNodes = function(s) {
	var result = [];
	
	for(var i = 0; i < this._relationships.length; ++i) {
		if(s == this._relationships[i]['s']) {
			result.push(this._relationships[i]);
		}
	}
	
	return result;
};

Graph.prototype.findPath = function(s, d) {
	var keys = Object.keys(this._nodes);

	var distTo = {};
	var edgeTo = {};
	var relax = {};
	
	for(var i = 0; i < keys.length; ++i) {
		distTo[keys[i]] = undefined;
	};
	
	for(var i = 0; i < keys.length; ++i) {
		edgeTo[keys[i]] = undefined;
	};
	
	for(var i = 0; i < keys.length; ++i) {
		relax[keys[i]] = 0;
	};
	
	var currentKey = s;
	
	distTo[currentKey] = 0.0;
	
	while (currentKey != undefined) {
		if(relax[currentKey] == 1) {
			continue;
		}
		
		var dests = this._getToNodes(currentKey);
		
		if(dests && dests.length) {
			for(var i = 0; i < dests.length; ++i) {
				if(relax[currentKey] == 0) {
					if(distTo[dests[i]['d']] == undefined || distTo[dests[i]['d']] > (distTo[currentKey] + dests[i]['w'])) {
						distTo[dests[i]['d']] = distTo[currentKey] + dests[i]['w'];
						edgeTo[dests[i]['d']] = currentKey;
					}
				}
			}
		}
		
		relax[currentKey] = 1;
		
		var nextKey = undefined;
		var minValue = undefined;
		
		for(var i = 0; i < keys.length; ++i) {
			if(relax[keys[i]] == 0) {
				if(minValue == undefined || minValue > distTo[keys[i]]) {
					minValue = distTo[keys[i]];
					nextKey = keys[i];
				}
			}
		}
		
		currentKey = nextKey;
	}

	var r = [];
	
	currentKey = d;
	
	while(currentKey != undefined) {
		if(edgeTo[currentKey] != undefined) {
			r.splice(0, 0, this._nodes[edgeTo[currentKey]]);
		}
		
		currentKey = edgeTo[currentKey];
	}
	
	if(r.length > 0) {
		r.push(this._nodes[d]);
	}
	
	return r;
};
