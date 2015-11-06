var http = require('http');
var https = require('https');
var url = require('url');
var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({
	//agent: https.globalAgent
});

proxy.on('open', function (proxySocket) {
	console.log('[open]');
});

http.createServer(function (req, res) {
  try {
	  console.log('-> host : ' + req.headers["host"]);
	  
	  reqURL = url.parse(req.url);
	  console.log('->  url : ' + JSON.stringify(reqURL));
	  //console.dir(req);
	  var targetURL = '' + reqURL['protocol'] + '//' + reqURL['hostname'] + ':' + (reqURL['port'] != null ? reqURL['port'] : (reqURL['protocol'] == 'https' ? 443 : 80));
	  //var targetURL = 'https://' + reqURL['hostname'] + ':443';
	  console.log('-> targetURL : ' + targetURL);
	  proxy.web(req, res, {target: targetURL});
  } catch(ex) {
	  console.log(ex);
  }
}).listen(process.env.PORT);
