'use strict';

var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var cookieJar = request.jar();

async.waterfall([
  function connnect (cb) {
    request({
      url: 'http://login.tradedoubler.com/pan/login',
      method: 'POST',
      jar: cookieJar,
      followAllRedirects: true,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
      },
      form: {
        j_username: 'widgetinfo',
        j_password: 'RbxTi3occnW2Jz'
      }
    }, cb);
  },
  function welcomePage (res, body, cb) {
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
], function (err, res) {
  console.log(err, res);
});
