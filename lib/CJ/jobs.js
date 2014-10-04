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


module.exports.retrieveAdvertiserInfo = function(id, cb) {
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
        activeProgramTerms: 'https://members.cj.com/member/publisher/' + companyId + '/advertiser/' + id + '/activeProgramTerms.json',
        contact: 'https://members.cj.com/member/advertiser/' + id + '/contact/' + companyId + '.json',
      };

      for(var key in links) {
        var selectedLink = links[key];

        links[key] = function(cb) {
          var url = selectedLink;
          requestHelper.authenticatedJsonRequest(url, cookieJar, cb);
        };
      }

      async.parallel(links, cb);
    },
    function fetchMoreInformations(data, cb) {
      var advertiserName = data.details.advertiser.organization;

      var url = 'https://members.cj.com/member/publisher/' + info.companyId;
      url += '/advertiserSearch.json?keywords=' + encodeURIComponent(advertiserName);

      requestHelper.authenticatedJsonRequest(url, jar, function(err, res) {
        if (err) {
          return cb(err);
        }

        res.advertisers.forEach(function(advertiser) {
          if (advertiser.advertiserId === id) {
            data.full = advertiser;
          }
        });

        cb(null, data);
      });
    }
  ], cb);
};
