'use strict';
var _ = require('lodash');

var MongoClient = require('mongodb').MongoClient;

var kdcapital = 'mongodb://localhost/kdcapital';
var kdmigrate = 'mongodb://localhost/kdmigrate';

MongoClient.connect(kdcapital).then(function(db){
    var collection = db.collection('tblcont');

    var cursor = collection.aggregate([
        { $project : {
            _id: 0,
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
        }}
    ], { cursor: { batchSize: 1 } });

    // Get all the aggregation results
    cursor.on('data', function(doc) {
        doc.phones = _(doc.phones).map(function(phone){
            phone = _.omitBy(phone, _.isNull);
            return phone.number ? phone : null;
        }).compact().value();

        doc.phones[0] && (doc.phones[0].isDefault = true);

        console.log(_.omitBy(doc, _.isNull));
    });

    cursor.once('end', function() {
        console.log('end')
    });
});
