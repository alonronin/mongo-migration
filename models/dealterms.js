'use strict';

var _ = require('lodash');

module.exports = {
    importDB: function (callback) {
        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblterms');
        var toCollection = toDB.collection('dealterm');

        var cursor = fromCollection.aggregate([
            { $project : {
                _id: 0,
                name: '$TERMS'
            }}
        ], { cursor: { batchSize: 1 } });

        console.log('dealterm started');

        cursor.toArray().then(function(docs){
            var arr = _(docs).map(function(doc){
                return _.omitBy(doc, _.isNull);
            }).compact().value();

            toCollection.insertMany(arr, function(err){
                console.log('dealterm finished with %s records.', arr.length);

                callback(err);
            })
        })
    }
};