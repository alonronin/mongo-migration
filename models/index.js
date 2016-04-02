'use strict';

var path = require('path');
var fs = require('fs');
var files = fs.readdirSync(__dirname);
var _ = require('lodash');

module.exports = _(files)
    .map(function (file) {
        var name = path.basename(file, '.js');
        if (name === 'index')
            return null;

        return require('./' + name);
    })
    .compact()
    .value();