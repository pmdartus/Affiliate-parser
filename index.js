'use strict';

var request = require('request');
var async = require('async');

var jar = request.jar();

async.waterfall([
  function(cb) {
    request({
      url: 'https://members.cj.com/member/foundation/memberlogin.do',
      method: 'POST',
      jar: jar,
      form: {
        uname: 'whichprogram@gmail.com',
        pw: 'YSUfz~so'
      }
    }, cb);
  },
  function(resp, body, cb) {
    var url = 'https://members.cj.com/member/publisher/4406512/advertisers.json';
    request({
      url: url,
      method: 'GET',
      jar: jar,
    }, cb);
  },
], function(err, resp, body){
  console.log(body);
});
