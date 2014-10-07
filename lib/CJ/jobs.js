'use strict';

var async = require('async');

var cjAuth = require('./auth');
var requestHelper = require('../helpers/request');

module.exports.retriveAllAdvertisers = function(cb) {
  async.waterfall([
    function authenticate(cb) {
      cjAuth.retrieveAuthInformations(cb);
    },
    function executeRequest(cookieJar, userInfo, cb) {
      var url = 'https://members.cj.com/member/publisher/' + userInfo.companyId + '/advertisers.json';
      requestHelper.authenticatedJsonRequest(url, cookieJar, cb);
    }
  ], cb);
};


module.exports.retrieveAdvertiserInfo = function(id, done) {
  var jar;
  var info;

  async.waterfall([
    function authenticate(cb) {
      cjAuth.retrieveAuthInformations(cb);
    },
    function executeRequest(cookieJar, userInfo, cb) {
      jar = cookieJar;
      info = userInfo;

      var companyId = userInfo.companyId;
      var links = {
        details: 'https://members.cj.com/member/advertiser/' + id + '/detail.json',
        comissionByCountry: 'https://members.cj.com/member/api/publisher/' + companyId + '/merchant/' + id + '/commissionsByCountry',
        programTerm: 'https://members.cj.com/member/publisher/' + companyId + '/programterms/' + id + '.json',
        contact: 'https://members.cj.com/member/advertiser/' + id + '/contact/' + companyId + '.json',
      };

      var generateLink = function(link) {
        return function(cb) {
          var url = link;
          requestHelper.authenticatedJsonRequest(url, cookieJar, cb);
        };
      };

      for(var key in links) {
        var selectedLink = links[key];
        links[key] = generateLink(selectedLink);
      }

      async.parallel(links, cb);
    }
  ], done);
};
