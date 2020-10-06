'use strict';
const fs = require('fs');
var convertIBMWatsonToDpe = require('./index.js');

var exampleJSON = require('./ibmwatson.sample.json');

const exampleOutput = convertIBMWatsonToDpe(exampleJSON);
console.log(JSON.stringify(exampleOutput, null, 2));

fs.writeFileSync(__dirname + '/test.json', JSON.stringify(exampleOutput, null, 2));
