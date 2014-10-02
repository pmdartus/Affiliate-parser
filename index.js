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
  function(resp, body, cb) {
    var advertiserId = JSON.parse(body)['advertisers'][1]['advertiserId'];

    console.log(advertiserId)

    async.parrallel({
      details: function(cb) {
        var url = 'https://members.cj.com/member/advertiser/' + advertiserId + '/detail.json';
        request({
          url: url,
          method: 'GET',
          jar: jar,
        }, cb);
      },
      comissionByCountry: function(cb) {
        var url = 'https://members.cj.com/member/api/publisher/4406512/merchant/' + advertiserId + '/commissionsByCountry';
        request({
          url: url,
          method: 'GET',
          jar: jar,
        }, cb);
      },
      batchTracking: function(cb) {
        var url = 'https://members.cj.com/member/advertiser/' + advertiserId + '/batchTracking.json';
        request({
          url: url,
          method: 'GET',
          jar: jar,
        }, cb);
      },
      activeProgramTerms: function(cb) {
        var url = 'https://members.cj.com/member/publisher/4406512/advertiser/' + advertiserId + '/activeProgramTerms.json';
        request({
          url: url,
          method: 'GET',
          jar: jar,
        }, cb);
      },
    }, cb);
  }
], function(err, resp, body){
  console.log(body);
});
