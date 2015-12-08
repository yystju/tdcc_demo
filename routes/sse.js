(function(module) {
  var express = require('express');
  
  var router = express.Router();
  
  var sse = sse || {};
  
  /* GET users listing. */
  router.get('/', function(req, res, next) {
    //res.removeHeader("Content-Type");
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    //console.log('--G--');
    res.send('data: ' + JSON.stringify({'a': 'a', 'dt': new Date()}) + '\n\n');
    //res.send();
    res.end();
  });
  
  module.exports = router;
})(module);
