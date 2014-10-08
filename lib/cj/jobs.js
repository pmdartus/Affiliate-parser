'use strict';

var async = require('async');

var cjAuth = require('./auth');

module.exports.retriveAllAdvertisers = function(cb) {
  async.waterfall([
    function authenticate(cb) {
      cjAuth.retrieveAuthInformations(cb);
    },
    function executeRequest(userInfo, cb) {
      var url = 'https://members.cj.com/member/publisher/' + userInfo.companyId + '/advertisers.json';
      cjAuth.request(url, 'GET', cb);
    }
  ], cb);
};


module.exports.retrieveAdvertiserInfo = function(id, done) {
  var info;
  var data;

  async.waterfall([
    function authenticate (cb) {
      cjAuth.retrieveAuthInformations(cb);
    },
    function requestInformations (userInfo, cb) {
      info = userInfo;
      var url = 'https://members.cj.com/member/publisher/' + info.companyId + '/advertiserSearch.json?advertiserIds=' + id;
      cjAuth.request(url, 'GET', cb);
    },
    function requestComissionInfo (res, cb) {
      if (res.totalResults !== 1) {
        var err = new Error('Impossible to retrieve right information for #' + id);
        return cb(err);
      }

      data = res.advertisers[0];
      async.map(data.programTerms, function(program, cb) {
        var programTermUrl = 'https://members.cj.com/member/publisher/' + info.companyId + '/programterms/' + program.id + '.json';
        cjAuth.request(programTermUrl, 'GET', cb);
      }, cb);
    },
    function mergeResult(res, cb) {
      data.programTerms = res;
      cb(null, data);
    }
  ], done);
};
