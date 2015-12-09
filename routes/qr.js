var express = require('express');
var qr = require('qr-image');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  var content = req.query['content'];
  
  console.log('content := ' + content);
  
  var code = qr.image(content, {type: 'png'});
  res.type('png');
  code.pipe(res);
});

module.exports = router;
