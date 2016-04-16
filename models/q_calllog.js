'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
    importDB: function (callback) {

        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblcalllog');
        var toCollection = toDB.collection('call');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 0,
                    //CallID: 0,
                    //Flag: 0,
                    //MergedTo: 0,
                    //upsize_ts: 0,
                    //CallTime: 0,
                    //ContactName: 0,
                    //ContID_old: 0,
                    CompID: 1,
                    ContID: 1,
                    created: '$CallDate',
                    updated: '$CallDate',
                    callDate: '$CallDate',
                    isDone: {$literal: true},
                    description: '$Notes',
                    archived: {$literal: false}
                }
            }
        ], {cursor: {batchSize: 1}});

        console.log('calls started');
        cursor.toArray().then(function (docs) {
            var company = toDB.collection('company');
            var contact = toDB.collection('contact');

            Promise.props({
                contact: contact.find().project({_id: 1, ContID: 1, fullName: 1, phones: 1, emails: 1}).toArray(),
                company: company.find().project({_id: 1, CompID: 1, name: 1, phones: 1, emails: 1}).toArray()
            }).then(function (cols) {
                var contacts = _.keyBy(cols.contact, 'ContID');
                var companies = _.keyBy(cols.company, 'CompID');
                var calls = _.map(docs, function(fu){
                    var result =_.extend(fu, {
                        contactId: _.get(contacts[fu.ContID], '_id'),
                        contact: contacts[fu.ContID] || {},
                        companyId: _.get(companies[fu.CompID], '_id'),
                        company: companies[fu.CompID] || {}
                    });
                    return result;
                });

                toCollection.insertMany(calls, function (err) {
                    console.log('calls finished with %s records.', calls.length);
                    callback(err);
                });

            }).catch(function(err){console.log('problem with promise:' , err);});
        }).catch(function(err){console.log('problem with to array:' , err);});
    }
};
