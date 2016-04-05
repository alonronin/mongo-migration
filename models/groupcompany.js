'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

module.exports = {
    importDB: function (callback) {
        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblmembership');
        var toCollection = toDB.collection('groupcompany');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 1,
                    groupid: 1,
                    compid: 1,
                    notes: [{note: '$notes'}],
                    archived: {$literal: false}
                }
            }
        ], {cursor: {batchSize: 1}});

        console.log('groupcompany started');

        cursor.toArray().then(function (docs) {
            console.log('finished to array now start promise');
            var company = toDB.collection('company');
            var group = toDB.collection('group');

            Promise.props({
                company: company.find().project({_id: 1, CompID: 1}).toArray(),
                group: group.find().project({_id: 1, groupid: 1}).toArray()
            }).then(function (cols) {
                var companies = _.keyBy(cols.company, 'CompID');
                var groups = _.keyBy(cols.group, 'groupid');
                console.log('finished promise now map company to groups');
                var memberships = _.map(docs, function (fu) {
                    var result = _.extend(fu, {
                        groupId: _.get(groups[fu.groupid], '_id'),
                        companyId: _.get(companies[fu.compid], '_id')
                    });
                    //if (result.companyId){
                        return result;
                    //}
                    //else return;
                });
                //console.log('finished map now insert items');
                //var finalmemberships = _.remove(memberships, function(item){return !!item} );
                //console.log('finished remove now lets insert');
                toCollection.insertMany(memberships, function (err) {
                    console.log('groupcompany finished with %s records.', memberships.length);
                    callback(err);
                });
            })
        }).catch(function (err) {
            console.log(err);
        });
    }
};