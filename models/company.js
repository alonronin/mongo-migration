'use strict';

var _ = require('lodash');
var Promise = require('bluebird');

module.exports = {
    importDB: function (callback) {
        var fromDB = this.fromDB;
        var toDB = this.toDB;

        var fromCollection = fromDB.collection('tblcomp');
        var toCollection = toDB.collection('company');

        var cursor = fromCollection.aggregate([
            {
                $project: {
                    _id: 0,
                    CompID: 1,
                    name: '$CompanyName',
                    referredby: '$ReferredBy',
                    doNotCall: {$and: ['$DONOTCALL']},
                    doNotEmail: {$and: ['$DONOTEMAIL']},
                    phones: [
                        {ext: '$Phone Area', number: '$Phone', type: {$literal: 'Phone'}},
                        {ext: '$Phone Area', number: '$Phone2', type: {$literal: 'Phone'}},
                        {ext: '$Phone Area', number: '$Phone Number', type: {$literal: 'Phone'}},
                        {ext: '$Fax Area', number: '$fax', type: {$literal: 'Fax'}},
                        {ext: '$Fax Area', number: '$fax2', type: {$literal: 'Fax'}},
                        {ext: '$Fax Area', number: '$Fax Number', type: {$literal: 'Fax'}},
                        {number: '$Intl Phone', type: {$literal: 'Intl Phone'}},
                        {number: '$Intl Fax', type: {$literal: 'Intl Fax'}},
                        {number: '$Toll#', type: {$literal: 'Toll Free'}}
                    ],
                    emails: [
                        {address: '$EmailName', isDefault: {$literal: true}}
                    ],
                    socials: [
                        {address: '$web site', isDefault: {$literal: true}, type: {$literal: 'Website'}}
                    ],
                    addresses: [
                        {
                            address: {$concat: [{$ifNull: ['$Address', '']}, ' ', {$ifNull: ['$Address2', '']}]},
                            city: '$City',
                            pob: '$pobox',
                            zip: '$PostalCode',
                            state: '$StateOrProvince',
                            country: '$Country',
                            isDefault: {$literal: true}
                        }
                    ],
                    timestamp: {$ifNull: ['$Date', '$Input Date']},
                    archived: {$eq: ['$Active', 1]}
                }
            }
        ], {cursor: {batchSize: 1}});

        console.log('company started');

        cursor.toArray().then(function (docs) {
            var arr = _(docs).map(function (doc) {
                doc.phones = _(doc.phones).map(function (phone) {
                    phone = _.omitBy(phone, _.isNull);
                    return phone.number ? phone : null;
                }).compact().value();
                doc.emails = _(doc.emails).map(function (email) {
                    return _.omitBy(email, _.isNull);
                }).compact().value();
                doc.socials = _(doc.socials).map(function (social) {
                    return _.omitBy(social, _.isNull)
                }).compact().value();
                doc.phones[0] && (doc.phones[0].isDefault = true);
                doc.emails[0] && (doc.emails[0].isDefault = true);
                doc.socials[0] && (doc.socials[0].isDefault = true);

                return _.omitBy(doc, _.isNull);
            }).compact().value();
            var addresses = toDB.collection('companyAddresses');
            Promise.props({
                addresses: addresses.find().project({_id: 0, addid: 0}).toArray()
            }).then(function (cols) {
                var alladdrescontactses = _.keyBy(cols.addresses, 'CompID');
                var companies = _.forEach(arr, function(fu){
                    fu.addresses.push(alladdrescontactses[fu.CompID]);
                });

                toCollection.insertMany(companies, function (err) {
                    console.log('company finished with %s records.', companies.length);
                    callback(err);
                });
            }).catch(function(err){
                console.log('problem with promise:' , err);
            });
        }).catch(function(err){
            console.log('problem with query:' , err);
        });
    }
};