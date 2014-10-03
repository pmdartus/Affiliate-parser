'use strict';

var request = require('request');
var async = require('async');

var jar = request.jar();
var companyId;

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

var retrieveAdvertiser = function(id, cb) {
  async.parallel({
    details: function(cb) {
      var url = 'https://members.cj.com/member/advertiser/' + id + '/detail.json';
      requestJSON(url, jar, cb);
    },
    comissionByCountry: function(cb) {
      var url = 'https://members.cj.com/member/api/publisher/' + companyId + '/merchant/' + id + '/commissionsByCountry';
      requestJSON(url, jar, cb);
    },
    batchTracking: function(cb) {
      var url = 'https://members.cj.com/member/advertiser/' + id + '/batchTracking.json';
      requestJSON(url, jar, cb);
    },
    activeProgramTerms: function(cb) {
      var url = 'https://members.cj.com/member/publisher/' + companyId + '/advertiser/' + id + '/activeProgramTerms.json';
      requestJSON(url, jar, cb);
    },
    contact: function(cb) {
      var url = 'https://members.cj.com/member/advertiser/' + id + '/contact/' + companyId + '.json';
      requestJSON(url, jar, cb);
    }
  }, function(err, data) {
    if (err) {
      return cb(err);
    }

    var advertiserName = data.details.advertiser.organization;
    var url = 'https://members.cj.com/member/publisher/' + companyId + '/advertiserSearch.json?keywords=' + encodeURIComponent(advertiserName);
    requestJSON(url, jar, function(err, res) {
      if (err) {
        return cb(err);
      }

      res.advertisers.forEach(function(advertiser) {
        if (advertiser.advertiserId === id) {
          data.full = advertiser;
        }
      });

      console.log(data);
      cb();
    });
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
    async.eachSeries(body.advertisers, function(advertiser, cb) {
      var advertiserId = advertiser.advertiserId;
      retrieveAdvertiser(advertiserId, cb);
    }, cb);
  }
], function(err){
  console.log(err);
});
