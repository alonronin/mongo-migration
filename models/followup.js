'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
    importDB: function (callback) {

        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblfu');
        var toCollection = toDB.collection('followup');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 0,
                    CompID: 1,
                    ContID: 1,
                    created: '$Date',
                    fudate: '$F/UDate',
                    isDone: {$eq: ['$status', {$literal: 'Completed'}]},
                    description: '$F/UComments',
                    archived: {$literal: false}
                }
            }
        ], {cursor: {batchSize: 1}});

        console.log('followup started');
        cursor.toArray().then(function (docs) {
            var company = toDB.collection('company');
            var contact = toDB.collection('contact');

            Promise.props({
                contact: contact.find().project({_id: 1, ContID: 1}).toArray(),
                company: company.find().project({_id: 1, CompID: 1}).toArray()
            }).then(function (cols) {
                var contacts = _.keyBy(cols.contact, 'ContID');
                var companies = _.keyBy(cols.company, 'CompID');
                var followups = _.map(docs, function(fu){
                    var result =_.extend(fu, {
                        contactId: _.get(contacts[fu.ContID], '_id'),
                        companyId: _.get(companies[fu.CompID], '_id')
                    });
                    return result;
                });

                toCollection.insertMany(followups, function (err) {
                    console.log('followup finished with %s records.', followups.length);
                    callback(err);
                });

            }).catch(function(err){console.log('problem with promise:' , err);});
        });
    }
};