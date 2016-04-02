'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var async = require('async');

var MongoClient = require('mongodb').MongoClient;

var kdcapital = 'mongodb://localhost/kdcapital';
var kdmigrate = 'mongodb://localhost/kdmigrate';

var models = require('./models');

Promise.props({
    fromDB: MongoClient.connect(kdcapital),
    toDB: MongoClient.connect(kdmigrate)
}).then(function (o) {
    console.log('import started');

    async.eachSeries(models, function (model, callback) {
        model.importDB.call(o, callback);
    }, function (err) {
        console.log('import finished.');

        if(err) console.error(err);
    })
});