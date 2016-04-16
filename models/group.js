'use strict';

var _ = require('lodash');

module.exports = {
    importDB: function (callback) {
        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblgroups');
        var toCollection = toDB.collection('group');

        var cursor = fromCollection.aggregate([
            { $project : {
                _id: 0,
                groupid: 1,
                name: '$gname',
                group: '$superg',
                notes: [{note: '$notes'}],
                timestamp: '$createdate',
                archived: {$literal: false}
            }}
        ], { cursor: { batchSize: 1 } });

        console.log('group started');

        cursor.toArray().then(function(docs){

            toCollection.insertMany(docs, function(err){
                console.log('group finished with %s records.', docs.length);

                callback(err);
            })
        })
    }
};