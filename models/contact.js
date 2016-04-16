'use strict';

var Promise = require('bluebird');
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
                    fullName: {$ifNull: ['$Name1', {$concat: [{$ifNull: ['$First Name', '']},' ', {$ifNull: ['$Last Name', '']}]}]},
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

        console.log('contact started');

        cursor.toArray().then(function (docs) {
            var arr = _(docs).map(function (doc) {
                if(doc.fullName) doc.fullName = _.trim(doc.fullName);

                doc.phones = _(doc.phones).map(function (phone) {
                    phone = _.omitBy(phone, _.isNull);
                    return phone.number ? phone : null;
                }).compact().value();

                doc.phones[0] && (doc.phones[0].isDefault = true);

                return _.omitBy(doc, _.isNull);
            }).compact().value();

            toCollection.insertMany(arr, function (err) {
                console.log('contact finished with %s records.', arr.length);

                callback(err);
            })
        });
    },

    relation: function (callback) {
        console.log('relation contact started');

        var db = this.db;

        var contact = db.collection('contact');
        var company = db.collection('company');
        var relation = db.collection('companycontact');

        Promise.props({
            contact: contact.find().project({_id: 1, CompID: 1}).toArray(),
            company: company.find({CompID: {$ne: null}}).project({_id: 1, CompID: 1}).toArray()
        }).then(function (cols) {
            var companies = _.keyBy(cols.company, 'CompID');

            var arr = _.reduce(cols.contact, function(result, contact){
                result.push({
                    companyId: _.get(companies[contact.CompID], '_id'),
                    contactId: contact._id
                });
                return result;
            }, []);

            relation.insertMany(arr, function(err){
                console.log('relation contact finished with %s records.', arr.length);
                callback(err);
            });
        })
    }
};
