'use strict';

var async = require('async');
var request = require('request');
var cheerio = require('cheerio');
var creds = require('../../config').creds.tradedoubler;

var cookieJar = request.jar();
var userInfo;

var defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36'
};

var postHeaders = defaultHeaders;
postHeaders['Content-Type'] = 'application/x-www-form-urlencoded';

var authenticate = function(cb) {
  async.waterfall([
    function login (cb) {
      request({
        url: 'http://login.tradedoubler.com/pan/login',
        method: 'POST',
        jar: cookieJar,
        followAllRedirects: true,
        headers: postHeaders,
        form: {
          j_username: creds.username,
          j_password: creds.password
        }
      }, cb);
    },
    function retrieveSiteIds (res, body, cb) {
      request({
        url: 'http://login.tradedoubler.com/pan/aProgramList.action',
        method: 'GET',
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
        },
        jar: cookieJar
      }, function(err, res, body) {
        if (err) {
          return cb(err);
        }

        var $ = cheerio.load(body);

        var siteIds = [];
        $('[name="programGEListParameterTransport.siteId"] option').each(function() {
          siteIds.push($(this).attr('value'));
        });

        cb(null, siteIds);
      });
    }
  ], function(err, res) {
    if (err) {
      return cb(err);
    }

    userInfo.siteIds = res;
    cb(null, userInfo);
  });
};

var retrieveAuthInformations = module.exports.retrieveAuthInformations = function (cb) {
  if (cookieJar && userInfo) {
    return cb(null, userInfo);
  }

  authenticate(cb);
};

module.exports.request = function(url, verb, cb) {
  var headers = verb === 'POST' ? postHeaders : defaultHeaders;

  async.waterfall([
    async.apply(retrieveAuthInformations),
    function executeRequest(userInfo, cb) {
      request({
        url: url,
        method: verb,
        headers: headers,
        jar: cookieJar
      }, cb);
    },
    function returnBody (res, body, cb) {
      cb(null, body);
    }
  ], cb);
};
