'use strict';

var _ = require('lodash');

module.exports = {
    importDB: function (callback) {
        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblterms');
        var toCollection = toDB.collection('dealtemr');

        var cursor = fromCollection.aggregate([
            { $project : {
                _id: 0,
                name: '$TERMS'
            }}
        ], { cursor: { batchSize: 1 } });

        // Get all the aggregation results
        cursor.on('data', function(doc) {
            var row = _.omitBy(doc, _.isNull);

            toCollection.insertOne(row, function (err) {
                if (err) callback(err);
            })
        });

        cursor.once('end', function () {
            callback(null)
        });

        cursor.on('error', function (err) {
            callback(err);
        });
    }
};