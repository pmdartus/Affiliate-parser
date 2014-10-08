'use strict';

var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var cookieJar = request.jar();

String.prototype.clean = function() {
  return this.replace(/\r\n/g, '').trim();
};

var parsePage = function(siteId, page, cb) {
  request({
    url: 'http://login.tradedoubler.com/pan/aProgramList.action',
    method: 'POST',
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
    },
    form: {
      "programGEListParameterTransport.siteId": siteId,
      "programGEListParameterTransport.pageSize": 100,
      "programGEListParameterTransport.currentPage": page
    },
    jar: cookieJar
  }, function(err, res, body) {
    if (err) {
      return cb(err);
    }

    var $ = cheerio.load(body);

    var orgs = [];
    $('#searchProgramsForm .listtable tr').each(function(i) {
      if (i === 0 || i === 1) {
        return;
      }

      var org = {};
      $(this).find('td').each(function(i) {
        if (i === 0) {
          org.name = $(this).text().clean();
          var onclick = $(this).find('a').first().attr('onclick');
          org.id = onclick.match(/getProgramCodeAffiliate.(\d*),/)[1];
        } else if (i === 1) {
          org.category = $(this).text().clean();
        } else if (i === 12) {
          org.mobileFriendly = $(this).text().indexOf('Yes') !== -1 ? true : false;
        } else if (i === 13) {
          org.urlToCrawle = 'http://login.tradedoubler.com/pan/aProgramInfoApplyRead.action?programId=' + org.id;
          org.urlToCrawle += '&affiliateId=' + siteId;
        }
      });

      orgs.push(org);
    });

    cb(null, orgs);
  });
};

var advertisersListFromSiteId = function(siteId, cb) {
  var orgs = [];
  var notFound = false;
  var currentPage = 1;

  async.doWhilst(
    function(cb) {
      parsePage(siteId, currentPage, function(err, res) {
        if (err) {
          return cb(err);
        }

        if (res.length === 0) {
          notFound = true;
          return cb();
        }

        res.forEach(function(item) {
          orgs.push(item);
        });

        currentPage += 1;
        cb();
      });
    },
    function() {
      return !notFound;
    },
    function(err) {
      cb(err, orgs);
    }
  );
};

var advertiserFromCrawleUrl = function(crawleUrl, cb) {
  request({
    url: crawleUrl,
    method: 'GET',
    jar: cookieJar,
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
    },
  }, function(err, res, body) {
    var org = {};

    var $ = cheerio.load(body);

    $('table a').each(function() {
      if ($(this).attr('target') === '_blank') {
        org.url = $(this).attr('href');
      }
    });

    $('table img').each(function() {
      console.log($(this).attr('src'));
      if ($(this).attr('src').match(/hst/)) {
        org.image = $(this).attr('src');
      }
    });

    org.comissions = [];
    org.currency = $('.listTable tr').slice(1).eq(0).find('td').slice(1).eq(0).text().clean();
    $('.listTable tr').slice(3).each(function() {
      var offer = {};

      offer.name = $(this).find('td').eq(0).text().clean();

      var flat = $(this).find('td').eq(1).text().clean();
      var value = $(this).find('td').eq(2).text().clean();
      if (flat) {
        offer.flat = value;
      } else {
        offer.percent = value;
      }

      org.comissions.push(offer);
    });

    cb(null, org);
  });
};

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
  // function welcomePage (res, body, cb) {
  //   request({
  //     url: 'http://login.tradedoubler.com/pan/aProgramList.action',
  //     method: 'GET',
  //     headers: {
  //       "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36"
  //     },
  //     jar: cookieJar
  //   }, function(err, res, body) {
  //     if (err) {
  //       return cb(err);
  //     }

  //     var $ = cheerio.load(body);

  //     var siteIds = [];
  //     $('[name="programGEListParameterTransport.siteId"] option').each(function() {
  //       siteIds.push($(this).attr('value'));
  //     });

  //     cb(null, siteIds);
  //   });
  // },
  // function retreiveInfoList (ids, cb) {
  //   // var siteId = ids[0];
  //   var siteId = 1428793;
  //   advertisersListFromSiteId(siteId, cb);
  // },
  function retriveAnAdvertiser (res, body, cb) {
    var url = 'http://login.tradedoubler.com/pan/aProgramInfoApplyRead.action?programId=210819&affiliateId=1428793';
    advertiserFromCrawleUrl(url, cb);
  }
], function (err, res) {
  console.log(err, res);
});
