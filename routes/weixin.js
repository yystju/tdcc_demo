var express = require('express');
var router = express.Router();
var fs = require('fs');
var xmlreader = require('xmlreader');

/* GET users listing. */
router.get('/', function(req, res, next) {
  var signature = req.query['signature'];
  var timestamp = req.query['timestamp'];
  var nonce = req.query['nonce'];
  
  console.log('signature : ' + signature);
  console.log('timestamp : ' + timestamp);
  console.log('nonce : ' + nonce);
  
  var echostr = req.query['echostr'];
  console.log('echostr : ' + echostr);
  
  if(echostr) {
    res.send(echostr);
  } else {
    res.send('success');
  }
});

var replies = JSON.parse(fs.readFileSync(__dirname + '/../test_reply.json', 'UTF-8'));

for(var i = 0; i < replies.length; ++i) {
  if(replies[i].isRegExp) {
    replies[i].pattern = new RegExp(replies[i].pattern);
  }
}

var getRuledMessage = function (content) {
  for(var i = 0; i < replies.length; ++i) {
    if((replies[i].pattern.test && replies[i].pattern.test(content)) || replies[i].pattern == content) {
      return replies[i].reply[(Math.round(255 * Math.random()) % replies[i].reply.length)]; //MAX reply list will be 255.
    }
  }
};

/* POST users listing. */
router.post('/', function(req, res, next) {
  var signature = req.query['signature'];
  var timestamp = req.query['timestamp'];
  var nonce = req.query['nonce'];
  
  console.log('signature : ' + signature);
  console.log('timestamp : ' + timestamp);
  console.log('nonce : ' + nonce);
  
  req.on('data', function(data) {
      data = data.toString();
      console.log(data);
      
      var outerRes = res;
      
      xmlreader.read(data, function (err, res){
        if(err) return console.log(err);
        
        var xml = res.xml; //Weixin root.
        
        var msgType = xml.MsgType.at(0).text();
        
        console.log('msgType : ' + msgType);
        
        var from = xml.FromUserName.at(0).text();
        var to = xml.ToUserName.at(0).text();
        var createDate = xml.CreateTime.at(0).text();
        
        console.log('FromUserName : ' + from);
        console.log('ToUserName : ' + to);
        console.log('CreateTime : ' + createDate);
        
        var retMsg = '';
        
        switch(msgType) {
        case 'text':
          var msgId = xml.MsgId.at(0).text();
          console.log('MsgId : ' + msgId);
        
          var content = xml.Content.at(0).text();
          console.log('Content : ' + content);
          
          var msg = getRuledMessage(content);
          
          if(!msg || msg == '') {
            msg = '是啊~';
          }
          
          retMsg = '<xml><ToUserName><![CDATA['+from+']]></ToUserName>'+
                    '<FromUserName><![CDATA['+to+']]></FromUserName>'+
                    '<CreateTime>'+(new Date()).getTime()+'</CreateTime>'+
                    '<MsgType><![CDATA[text]]></MsgType>'+
                    '<Content><![CDATA['+msg+']]></Content></xml>';
          break;
        case 'location':
          var msgId = xml.MsgId.at(0).text();
          console.log('MsgId : ' + msgId);
        
          var longitude = xml.Location_Y.at(0).text();
          console.log('longitude : ' + longitude);
          
          var latitude = xml.Location_X.at(0).text();
          console.log('latitude : ' + latitude);
          var Label = xml.Label.at(0).text();
          console.log('Label : ' + Label);
          
          var msg = '去 '+Label+'('+longitude+', '+latitude+')干吗？ 在家呆着得了！';
          
          retMsg = '<xml><ToUserName><![CDATA['+from+']]></ToUserName>'+
                    '<FromUserName><![CDATA['+to+']]></FromUserName>'+
                    '<CreateTime>'+(new Date()).getTime()+'</CreateTime>'+
                    '<MsgType><![CDATA[text]]></MsgType>'+
                    '<Content><![CDATA['+msg+']]></Content></xml>';
          break;
        case 'event':
          var eventType = xml.Event.at(0).text();
          console.log('eventType : ' + eventType);
          var eventKey = xml.EventKey.at(0).text();
          console.log('eventKey : ' + eventKey);
          break;
        default:
          outerRes.send('');
        }
        
        outerRes.send(retMsg);
      });
  });

});


module.exports = router;
