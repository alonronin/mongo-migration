'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var async = require('async');

var MongoClient = require('mongodb').MongoClient;

var kdmigrate = 'mongodb://localhost/kdmigrate';

var limit = 10;

var models = _.filter(require('./models'), 'relation');

MongoClient.connect(kdmigrate).then(function (db) {
    async.eachLimit(models, limit, function (model, callback) {
        model.relation.call({db: db}, callback);
    }, function (err) {
        if(err) console.error(err);
        console.log('relation finished');
    })
});