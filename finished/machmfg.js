'use strict';

var _ = require('lodash');

module.exports = {
    importDB: function (callback) {
        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblmfg');
        var toCollection = toDB.collection('machmfg');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 0,
                    mfgID: 1,
                    name: '$mfg',
                    archived: {$literal: false}
                }
            }
        ], {cursor: {batchSize: 1}});

        console.log('mfg started');

        cursor.toArray().then(function (docs) {

            toCollection.insertMany(docs, function (err) {
                console.log('mfg finished with %s records.', docs.length);

                callback(err);
            })
        });
    }
};