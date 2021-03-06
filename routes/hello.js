(function(module) {
  var express = require('express');
  var https = require("https");
  var fs = require("fs");
  
  var router = express.Router();
  
  var hello = hello || {};
  hello.__tokenExpireDate__ = null;
  hello.__token__ = null;
  
  var config = JSON.parse(fs.readFileSync(__dirname + '/../config.json'));
  
  if(config) {
    hello.appid = config.appid;
    hello.secret = config.secret;
  }
  
  console.log('hello.appid : ' + hello.appid);
  console.log('hello.secret : ' + hello.secret);
  
  //'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET';
  var getWeixinToken = function() {
    return new Promise(function(resolve, reject) {
      var now = new Date();
      if(hello.__tokenExpireDate__ && (hello.__tokenExpireDate__ - now) > 30000 && hello.__token__) {
        resolve(hello.__token__, hello.__tokenExpireDate__);
      } else {
        var options = {
          host: 'api.weixin.qq.com',
          port: 443,
          path: '/cgi-bin/token?grant_type=client_credential&appid='+hello.appid+'&secret='+hello.secret,
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
        };
    
        var req = https.request(options, function(res) {
          var output = '';
          //console.log(options.host + ':' + res.statusCode);
          res.setEncoding('utf8');
      
          res.on('data', function (chunk) {
            output += chunk;
          });
      
          res.on('end', function() {
              var obj = JSON.parse(output);
              
              var token = obj['access_token'];
              var expireDate = new Date(new Date().getTime() + obj['expires_in']);
              
              hello.__token__ = token;
              hello.__tokenExpireDate__ = expireDate;
              
              if(token) {
                resolve(token, expireDate);
              } else {
                reject(token);
              }
          });
        });
        
        req.on('error', function(err) {
          reject(err);
        });
      
        req.end();
      }
    });
  };
  
  //'https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=ACCESS_TOKEN'
  var getWeixinServerList = function(token) {
    return new Promise(function(resolve, reject) {
      var options = {
          host: 'api.weixin.qq.com',
          port: 443,
          path: '/cgi-bin/getcallbackip?access_token=' + token,
          method: 'GET',
          headers: {
              'Content-Type': 'application/json'
          }
        };
    
        var req = https.request(options, function(res) {
          var output = '';
          console.log(options.host + ':' + res.statusCode);
          res.setEncoding('utf8');
      
          res.on('data', function (chunk) {
              output += chunk;
          });
      
          res.on('end', function() {
              var obj = JSON.parse(output);
              
              var serverList = obj['ip_list'];
              
              if(serverList) {
                resolve(serverList);
              } else {
                reject(serverList);
              }
          });
        });
        
        req.on('error', function(err) {
          reject(err);
        });
      
        req.end();
    });
  };
  
  //'https://api.weixin.qq.com/shakearound/account/register?access_token=ACCESS_TOKEN'
  var apply4ShakeAround = function(token) {
    var data = {
      "name": "石全",
      "phone_number": "15802243175",
      "email": "quan.shi@volvo.com",
      "industry_id": "0308",
      "qualification_cert_urls": [
      ],
      "apply_reason": "测试服务号使用摇一摇功能"
    };
    
    var txt = JSON.stringify(data);
    
    return new Promise(function(resolve, reject) {
      var options = {
          host: 'api.weixin.qq.com',
          port: 443,
          path: '/shakearound/account/register?access_token=' + token,
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Content-Length': txt.length
          }
        };
    
        var req = https.request(options, function(res) {
          var output = '';
          console.log(options.host + ':' + res.statusCode);
          res.setEncoding('utf8');
          
          res.on('data', function (chunk) {
              output += chunk;
          });
      
          res.on('end', function() {
            resolve(output);
          });
        });
        
        req.on('error', function(err) {
          reject(err);
        });
      
        req.write(txt + '\n');
      
        req.end();
    });
  };
  
  //'https://api.weixin.qq.com/cgi-bin/user/info?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN'
  
  /* GET users listing. */
  router.get('/', function(req, res, next) {
    var p = getWeixinToken();
    
    var errorHandler = function(err) {console.error(err)};
    
    p.then(function(token) {
      console.log('token : ' + token);
      // getWeixinServerList(token).catch(errorHandler).then(function(serverList) {
      //   console.log(JSON.stringify(serverList));
      // }).catch(errorHandler);
      
      apply4ShakeAround(token).then(function(out) {
        console.log(out);
      }).catch(errorHandler);
    });
    res.send('--1--');
  });
  
  module.exports = router;
})(module);
