'use strict';

var _ = require('lodash');
var MongoClient = require('mongodb').MongoClient;
var source = 'mongodb://localhost/db0329';
var company = [
    {_id: 15001, CompID: 1},
    {_id: 15002, CompID: 2},
    {_id: 15003, CompID: 3},
    {_id: 15004, CompID: 4}
];
var contact = [
    {_id: 12001, ContID: 1},
    {_id: 12002, ContID: 2},
    {_id: 12003, ContID: 3}
];
var followup = [
    { '_id': 17001, 'CompID': 1, 'ContID': 1, kaka: '5435345'},
    { '_id': 17002, 'CompID': 1, 'ContID': 1, kaka2: '5435345' },
    { '_id': 17003, 'CompID': 2, 'ContID': 3, kaka: '5435345'},
    { '_id': 17004, 'CompID': 4, 'ContID': 3, kaka4: '5435345' },
    { '_id': 17005, 'CompID': 3, 'ContID': 2, kaka: '5435345'}
];
var contacts = _.keyBy(contact, 'ContID');
var companies = _.keyBy(company, 'CompID');
//var followups = [];
var followups = _.map(followup, function(fu){
        return _.extend(fu, {
            contId: _.get(contacts[fu.ContID], '_id'),
            compId: _.get(companies[fu.CompID], '_id')
        });
});


console.log(followups);

