const convert = require('./index.js');
// const sampleJson = require('./assemblyai-sample.json');
const sampleJson = require('./assemblyai-speakers-sample.json');

const json = convert(sampleJson);

console.log(json);
