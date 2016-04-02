'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var async = require('async');

var MongoClient = require('mongodb').MongoClient;

var kdcapital = 'mongodb://localhost/kdcapital';
var kdmigrate = 'mongodb://localhost/kdmigrate';

var limit = 10;

var models = require('./models');

Promise.props({
    fromDB: MongoClient.connect(kdcapital),
    toDB: MongoClient.connect(kdmigrate)
}).then(function (o) {
    async.eachLimit(models, limit, function (model, callback) {
        model.importDB.call(o, callback);
    }, function (err) {
        console.error(err);
    })
});