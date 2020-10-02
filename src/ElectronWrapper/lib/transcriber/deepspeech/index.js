'use strict';
const deepSpeechSttWrapper = require('deepspeech-node-wrapper');
// const convertPoketsphinxOutputToJson = require('./pocketsphinx-output-to-json/index.js');
/**
 * @function transcribe
 * @description transcribes
 * @param {object} config - The parameter containting attribute options.
 * @param {object} config.audio - file path to audio
 * @param  promise
 */
function transcribe(audioFile, models) {
  console.log('deepspeech: getting started');

  return new Promise((resolve, reject) => {
    // TODO: convert to audio wav specs first
    deepSpeechSttWrapper(audioFile, models)
      .then(res => {
        console.info('deepspeech: response ');
        resolve(res);
      })
      .catch(error => {
        console.log(error);
        reject(error);
      });
  });
}

module.exports = transcribe;
