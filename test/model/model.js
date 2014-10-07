'use strict';

var async = require('async');
var mongoose =require('mongoose');
var dbHelper = require('../helpers/db');

require('../../lib/model');
var RawExtract = mongoose.model('RawExtract');

describe('RawExtract model', function () {

  beforeEach(function(cb) {
    dbHelper.emptyMongo();
    cb();
  });

  it('should be able to create a rawExtract', function(done) {
    var dataToSave = {
      foo: 'bar'
    };

    RawExtract.findAndUpdate(1, 'cj', dataToSave, function(err, res) {
      if (err) {
        return done(err);
      }

      res.should.have.property('id', '1');
      res.should.have.property('platform', 'cj');
      res.should.have.properties('data', 'created', 'updated');

      done();
    });
  });

  it('should update an existed record', function(done) {
    async.waterfall([
      function(cb) {
        RawExtract.findAndUpdate(1, 'cj', {foo: 'bar'}, cb);
      },
      function(res, cb) {
        RawExtract.findAndUpdate(1, 'cj', {foo: 'foo'}, cb);
      },
      function(res, cb) {
        res.should.have.property('data');
        res.data.should.have.property('foo', 'foo');

        RawExtract.find({}, cb);
      },
      function(res, cb) {
        res.should.have.a.lengthOf(1);
        res[0].should.have.properties('data', 'created', 'updated');
        cb();
      }
    ], done);
  });
});
