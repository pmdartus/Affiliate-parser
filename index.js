'use strict';

var request = require('request');
var async = require('async');

var jar = request.jar();
var companyId;
var advertiserId;

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
  function retrieveAutehnticationCookie(cb) {
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
  function getAllAdvertisers(res, body, cb) {
    var companyIdCookie = jar.store.idx['cj.com']['/'].jsCompanyId;
    companyId = companyIdCookie.toString().match(/jsCompanyId=(\d*?);/)[1];

    var url = 'https://members.cj.com/member/publisher/' + companyId + '/advertisers.json';

    requestJSON(url, jar, cb);
  },
  function retrieveBasicInformations(body, cb) {
    var advertiser = body.advertisers[1];
    advertiserId = advertiser.advertiserId;

    async.parallel({
      details: function(cb) {
        var url = 'https://members.cj.com/member/advertiser/' + advertiserId + '/detail.json';
        requestJSON(url, jar, cb);
      },
      comissionByCountry: function(cb) {
        var url = 'https://members.cj.com/member/api/publisher/' + companyId + '/merchant/' + advertiserId + '/commissionsByCountry';
        requestJSON(url, jar, cb);
      },
      batchTracking: function(cb) {
        var url = 'https://members.cj.com/member/advertiser/' + advertiserId + '/batchTracking.json';
        requestJSON(url, jar, cb);
      },
      activeProgramTerms: function(cb) {
        var url = 'https://members.cj.com/member/publisher/' + companyId + '/advertiser/' + advertiserId + '/activeProgramTerms.json';
        requestJSON(url, jar, cb);
      },
      contact: function(cb) {
        var url = 'https://members.cj.com/member/advertiser/' + advertiserId + '/contact/' + companyId + '.json';
        requestJSON(url, jar, cb);
      }
    }, cb);
  },
  function findRemainingInformartionsViaSearch(data, cb) {
      var advertiserName = data.details.advertiser.organization;
      var url = 'https://members.cj.com/member/publisher/' + companyId + '/advertiserSearch.json?keywords=' + encodeURIComponent(advertiserName);
      requestJSON(url, jar, function(err, res) {
        if (err) {
          return cb(err);
        }

        res.advertisers.forEach(function(advertiser) {
          if (advertiser.advertiserId === advertiserId) {
            data.full = advertiser;
          }
        });

        cb(null, data);
      });
  }
], function(err, res){
  console.log(res);
});
