'use strict';

var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var source = 'mongodb://localhost/db0329';

var connection =MongoClient.connect(source)
    .then(function (db) {
        var cursor = db.collection('tblfu').aggregate([
            {
                $lookup: {
                    from: "tblcomp",
                    localField: "CompID",
                    foreignField: "CompID",
                    as: "company"
                }
            },
            //{
            //    $lookup: {
            //        from: "tblcont",
            //        localField: "ContID",
            //        foreignField: "ContID",
            //        as: "contact"
            //    }
            //},
            //{
            //    $unwind: "$contact"
            //},
            {
                $unwind: "$company"
            },
            {
                $project: {
                    _id: 0,
                    compId: '$company._id',
                    contId: '$contact._id',
                    created: '$Date',
                    fudate: '$F/UDate',
                    completed: {$eq: ['$status', {$literal: 'Completed'}]},
                    notes: [{note: '$F/UComments', isDefault: {$literal: true}}],
                    archived: {$literal: false}
                }
            }
        ], {cursor: {batchSize: 1}});

        cursor.on('data', function (row) {
            console.log(row);
        });

        cursor.on('error', function (err) {
            console.log(err);
        });

        cursor.on('end', function () {
            console.log('end');
            connection.close();
        });


    }).catch(function (err) {
        console.log(err);
    });


