'use strict';

var _ = require('lodash');

module.exports = {
    importDB: function (callback) {
        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tbladdress');
        var toCollection = toDB.collection('companyAddresses');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 0,
                    CompID: 1,
                    addid: 1,

                    address: {$concat: [{$ifNull: ['$AddressLine', '']}, ' ', {$ifNull: ['$AddressLine2', '']}]},
                    city: '$City',
                    zip: '$PostalCode',
                    state: '$StateOrProvince',
                    country: '$Country',

                    isDefault: {$eq: ['$primary',{$literal: 'yes'}]},
                    created: '$createdate',
                    archived: {$eq: ['$Active', 1]}
                }
            }
        ], {cursor: {batchSize: 1}});

        console.log('addresses of companies started');

        cursor.toArray().then(function (docs) {

            toCollection.insertMany(docs, function (err) {
                console.log('addresses of companies finished with %s records.', docs.length);
                callback(err);
            })
        });
    }
};