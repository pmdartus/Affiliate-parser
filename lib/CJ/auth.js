'use strict';

var request = require('request');
var creds = require('../../config').creds.cj;

var cookieJar = request.jar();
var userInfo;

var authenticate = function(cb) {
  request({
    url: 'https://members.cj.com/member/foundation/memberlogin.do',
    method: 'POST',
    jar: cookieJar,
    form: {
      uname: creds.username,
      pw: creds.password
    }
  }, function(err) {
    if (err) {
      return cb(err);
    }

    userInfo = {};
    var companyIdCookie = cookieJar.store.idx['cj.com']['/'].jsCompanyId;
    userInfo.companyId = companyIdCookie.toString().match(/jsCompanyId=(\d*?);/)[1];

    return cb(null, cookieJar, userInfo);
  });
};

module.exports.retrieveAuthInformations = function (cb) {
  if (cookieJar && userInfo) {
    return cb(null, cookieJar, userInfo);
  }

  authenticate(cb);
};
