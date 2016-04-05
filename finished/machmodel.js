'use strict';

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
    importDB: function (callback) {

        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblmodel');
        var toCollection = toDB.collection('machmodel');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 0,
                    mdlID: 1,
                    name: '$mdl',
                    archived: {$literal: false}
                }
            }
        ], {cursor: {batchSize: 1}});

        console.log('models started');
        cursor.toArray().then(function (docs) {
            var mfg = toDB.collection('machmfg');

            Promise.props({
                mfg: mfg.find().project({_id: 1, mfgID: 1}).toArray()
            }).then(function (cols) {
                var mfgs = _.keyBy(cols.mfg, 'mfgID');

                var models = _.map(docs, function(m){
                    var result =_.extend(m, {
                        machmfgId: _.get(mfgs[m.mdlID], '_id')
                    });
                    return result;
                });

                toCollection.insertMany(models, function (err) {
                    console.log('models finished with %s records.', models.length);
                    callback(err);
                });

            }).catch(function(err){console.log('problem with promise:' , err);});
        });
    }
};