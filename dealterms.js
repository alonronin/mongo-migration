'use strict';
var _ = require('lodash');

var MongoClient = require('mongodb').MongoClient;

var kdcapital = 'mongodb://localhost/db3003';
var kdmigrate = 'mongodb://localhost/kdmigrate';

MongoClient.connect(kdcapital).then(function(db){
    var collection = db.collection('tblterms');

    var cursor = collection.aggregate([
        { $project : {
            _id: 0,
            name: '$TERMS'
        }}
    ], { cursor: { batchSize: 1 } });
    cursor.on('data', function(doc) {
        console.log(_.omitBy(doc, _.isNull));
    });

    cursor.once('end', function() {
        console.log('end')
    });
});
