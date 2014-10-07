'use strict';

var async = require('async');
var request = require('request');
var creds = require('../../config').creds.zanox;

var cookieJar = request.jar();
var userInfo;

var authenticate = function(cb) {
  var url = 'https://auth.zanox.com/connect/login?';
  url += 'loginForm.userName=' + creds.username + '&loginForm.password=' + creds.password;
  url += '&loginForm.loginViaUserAndPassword=true&login=Login';

  request({
    url: url,
    method: 'POST',
    jar: cookieJar,
    followAllRedirects: true,
  }, function(err, res, body) {
    if (err) {
      return cb(err);
    }

    userInfo = {};
    try {
      userInfo.publisherId = body.match(/"userid":([\d]*)/)[1];
      userInfo.adSpaceId = body.match(/"adspace":{"id":([\d]*)/)[1];
    } catch (e) {
      return cb('Authentication failed!', e);
    }

    return cb(null, cookieJar, userInfo);
  });
};

var retrieveAuthInformations = module.exports.retrieveAuthInformations = function (cb) {
  if (cookieJar && userInfo) {
    return cb(null, cookieJar, userInfo);
  }

  authenticate(cb);
};

module.exports.request = function(url, verb, cb) {
  async.waterfall([
    async.apply(retrieveAuthInformations),
    function executeRequest(cookieJar, userInfo, cb) {
      request({
        url: url,
        method: verb,
        jar: cookieJar
      }, cb);
    },
    function returnBody (res, body, cb) {
      cb(null, body);
    }
  ], cb);
};
