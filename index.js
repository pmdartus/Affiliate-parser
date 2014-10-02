'use strict';

var request = require('request');
var async = require('async');

var jar = request.jar();

var requestJSON = function(url, cookieJar, cb) {
  request({
    url: url,
    method: 'GET',
    jar: cookieJar,
  }, function(err, res, body) {
    if (err) {
      return cb(err);
    }

    cb(null, JSON.parse(body));
  });
};

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
  function(res, body, cb) {
    var url = 'https://members.cj.com/member/publisher/4406512/advertisers.json';
    requestJSON(url, jar, cb);
  },
  function(body, cb) {
    var advertiserId = body.advertisers[1].advertiserId;
    console.log(advertiserId);

    async.parallel({
      details: function(cb) {
        var url = 'https://members.cj.com/member/advertiser/' + advertiserId + '/detail.json';
        requestJSON(url, jar, cb);
      },
      comissionByCountry: function(cb) {
        var url = 'https://members.cj.com/member/api/publisher/4406512/merchant/' + advertiserId + '/commissionsByCountry';
        requestJSON(url, jar, cb);
      },
      batchTracking: function(cb) {
        var url = 'https://members.cj.com/member/advertiser/' + advertiserId + '/batchTracking.json';
        requestJSON(url, jar, cb);
      },
      activeProgramTerms: function(cb) {
        var url = 'https://members.cj.com/member/publisher/4406512/advertiser/' + advertiserId + '/activeProgramTerms.json';
        requestJSON(url, jar, cb);
      },
    }, cb);
  }
], function(err, res){
  console.log(res);
});
