'use strict';

var request = require('request');

module.exports.authenticatedJsonRequest = function (url, cookieJar, cb) {
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
