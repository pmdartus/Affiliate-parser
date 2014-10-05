'use strict';

var request = require('request');
var async = require('async');
var cheerio = require('cheerio');

var jar = request.jar();
var publisherId;
var adSpaceId;
var selectedAdvertiser;

async.waterfall([
  function retrieveAutehnticationCookie(cb) {
    var creds = {
      userName: 'elalj',
      password: '1363127443'
    };

    var url = 'https://auth.zanox.com/connect/login?';
    url += 'loginForm.userName=' + creds.userName + '&loginForm.password=' + creds.password + '&loginForm.loginViaUserAndPassword=true&login=Login';

    request({
      url: url,
      method: 'POST',
      jar: jar,
      followAllRedirects: true,
    }, cb);
  },
  function getAllAdvertisers(res, body, cb) {
    try {
      publisherId = body.match(/userid":(\d*?)}/)[1];
      adSpaceId = body.match(/"adspace":{"id":(\w*?),/)[1];
    } catch (e) {
      return cb('Authentication failed!', e);
    }

    var url = 'https://marketplace.zanox.com/zanox/affiliate/' + publisherId + '/merchant-directory/xhr-directory/pageNumber/1/pageLength/100';
    request({
      url: url,
      method: 'POST',
      jar: jar,
    }, cb);
  },
  function parseAdvertiserList(res, body, cb) {
    var advertisers = [];
    var $ = cheerio.load(body);

    $('tbody tr').each(function() {
      var advertiser = {};
      $(this).find('td').each(function(i) {
        if (i === 0) {
          advertiser.name = $(this).find('.company').attr('title');
          advertiser.id = $(this).find('a').attr('href').match(/\/merchant-profile\/(\d*)/)[1];
        }

        if (i === 1) {
          advertiser.transformationRate = $(this).text();
        }

        if (i === 2) {
          advertiser.validationRate = $(this).text();
        }

        if (i === 3) {
          advertiser.validationDelai = $(this).text();
        }

        if (i === 4) {
          advertiser.paiementDelai = $(this).text();
        }

        if (i === 5) {
          advertiser.epc = $(this).text();
        }

        if (i === 6) {
          advertiser.adRank = $(this).text();
        }

        if (i === 7) {
          advertiser.productCatalog = $(this).text();
        }

        if (i === 8) {
          // TODO: To debug
          advertiser.creationDate = new Date($(this).text());
        }
      });

      advertisers.push(advertiser);
    });

    cb(null, advertisers);
  },
  function retrieveAdvertiserData(advertisers, cb) {
    selectedAdvertiser = advertisers[1];
    request({
      url: 'https://marketplace.zanox.com' + selectedAdvertiser.crawleUrl,
      method: 'GET',
      jar: jar
    }, cb);
  },
  function parseAdvertiser(res, body, cb) {
    var advertiserInfo = {};

    var $ = cheerio.load(body);

    advertiserInfo.name = $('.accountName h1').text();
    advertiserInfo.id = $('#accountId strong').text();

    advertiserInfo.shortDescription = $('#descriptionShort').text();
    advertiserInfo.longDescription = $('#descriptionLongContent').text();

    advertiserInfo.contact = {};
    advertiserInfo.contact.name = $('#profileContactContent #name').text();
    advertiserInfo.contact.tel = $('#profileContactContent #tel').text() || $('#profileContactContent #mob').text();
    advertiserInfo.contact.email = $('#profileContactContent .tooltipTextContent').text();

    advertiserInfo.mobileOptimized = $('.mobileIcon').text();

    advertiserInfo.details = [];
    $('#programmeDetails .tick').each(function() {
      advertiserInfo.details.push($(this).text());
    });

    $('#profileLinksContent a').each(function() {
      if ($(this).text().trim() === 'Site Web') {
        advertiserInfo.url = $(this).attr('href');
      } else {
        advertiserInfo.links = advertiserInfo.links || [];
        advertiserInfo.links.push($(this).attr('href'));
      }
    });
    cb(null ,advertiserInfo);
  },
  function retrieveKeyFigures(data, cb) {
    request({
      url: 'https://marketplace.zanox.com' + selectedAdvertiser.crawleUrl + '/commission-groups',
      method: 'GET',
      jar: jar
    }, function(err, res, body) {
      if (err) {
        return cb(err);
      }

      var $ = cheerio.load(body);

      data.keyFigures = [];
      $('#merchantKeyFigures li').each(function() {
        data.keyFigures.push($(this).text());
      });

      cb(null, data);
    });
  }
], function(err, res){
  console.log(err, res);
});
