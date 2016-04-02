'use strict';

var _ = require('lodash');

module.exports = {
    importDB: function (callback) {
        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblcont');
        var toCollection = toDB.collection('contact');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 0,
                    ContID: 1,
                    CompID: 1,
                    firstName: '$First Name',
                    lastName: '$Last Name',
                    fullName: '$Name',
                    jobTitle: '$Title',
                    phones: [
                        {ext: '$Ext', number: '$Direct Phone', type: {$literal: 'Phone'}},
                        {number: '$Cell Phone', type: {$literal: 'Mobile'}},
                        {ext: '$Ext', number: '$Direct Fax', type: {$literal: 'Fax'}},
                        {ext: '$Ext', number: '$Pager', type: {$literal: 'Pager'}},
                        {ext: '$FaxArea', number: '$FaxNumber', type: {$literal: 'Fax'}},
                        {number: '$WorkPhone1', type: {$literal: 'Work'}},
                        {number: '$WorkPhone2', type: {$literal: 'Work'}},
                        {number: '$FaxNumber1', type: {$literal: 'Fax'}},
                        {number: '$FaxNumber2', type: {$literal: 'Fax'}},
                        {number: '$International Phone', type: {$literal: 'International Phone'}},
                        {number: '$International Fax', type: {$literal: 'International Fax'}},
                        {ext: '$WorkArea', number: '$WorkPhone', type: {$literal: 'Work'}}
                    ],
                    emails: [
                        {address: '$Email', notes: {note: '$Email Text'}, isDefault: {$literal: true}}
                    ],
                    notes: [{note: '$Notes'}],
                    timestamp: '$Input Date',
                    archived: {$literal: false}
                }
            }
        ], {cursor: {batchSize: 1}});

        // Get all the aggregation results
        cursor.on('data', function (doc) {
            doc.phones = _(doc.phones).map(function (phone) {
                phone = _.omitBy(phone, _.isNull);
                return phone.number ? phone : null;
            }).compact().value();

            doc.phones[0] && (doc.phones[0].isDefault = true);

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
    },

    relation: function (callback) {
        var db = this.db;
        var companies = {};

        var contact = db.collection('contact');
        var company = db.collection('company');

        var cursor = contact.find({CompID: {$ne: null}});

        cursor.on('data', function (doc) {

        });

        cursor.once('end', function () {
            callback(null)
        });

        cursor.on('error', function (err) {
            callback(err);
        });

    }

};
