'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
    importDB: function (callback) {

        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblwtd');
        var toCollection = toDB.collection('wanted');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 0,
                    CompID: 1,
                    ContID: 1,
                    mfgid: 1,
                    modelid: 1,
                    created: '$Input Date',
                    description: '$Description',
                    archived: {$literal: false},
                    isDone: {$literal: false}
                }
            }
        ], {cursor: {batchSize: 1}});

        console.log('wanteds started');
        cursor.toArray().then(function (docs) {
            var company = toDB.collection('company');
            var contact = toDB.collection('contact');
            var mfg = toDB.collection('machmfg');
            var model = toDB.collection('machmodel');

            Promise.props({
                contact: contact.find().project({_id: 1, ContID: 1}).toArray(),
                company: company.find().project({_id: 1, CompID: 1}).toArray(),
                mfg: mfg.find().project({_id: 1, CompID: 1}).toArray(),
                model: model.find().project({_id: 1, CompID: 1}).toArray()
            }).then(function (cols) {
                var contacts = _.keyBy(cols.contact, 'ContID');
                var companies = _.keyBy(cols.company, 'CompID');
                var mfgs = _.keyBy(cols.mfg, 'CompID');
                var models = _.keyBy(cols.model, 'CompID');

                var wanteds = _.map(docs, function(fu){
                    var result =_.extend(fu, {
                        contactId: _.get(contacts[fu.ContID], '_id'),
                        companyId: _.get(companies[fu.CompID], '_id'),
                        machmfgId: _.get(mfgs[fu.mfgid], '_id'),
                        machmodelId: _.get(models[fu.modelid], '_id')
                    });
                    return result;
                });

                toCollection.insertMany(wanteds, function (err) {
                    console.log('wanteds finished with %s records.', wanteds.length);
                    callback(err);
                });

            }).catch(function(err){console.log('problem with promise:' , err);});
        });
    }
};