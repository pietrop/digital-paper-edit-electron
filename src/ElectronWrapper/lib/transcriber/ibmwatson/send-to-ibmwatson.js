/**
* @module sendToIBMWatson
* @description node SDK to connect to IMB Watson API STT Service
* @description Takes audio file less then 100mb and sends it to IBM watson to be transcribed.
* Transcription is then saved as a file. and path of that file is returned.
* [Node SDK speech-to-text]{@link https://github.com/watson-developer-cloud/node-sdk#speech-to-text}
* [IBM speech-to-text]{@link https://www.ibm.com/watson/developercloud/speech-to-text}
* [IBM STT API reference]{@link https://www.ibm.com/watson/developercloud/speech-to-text/api/v1/#get_models}
*
* @example <caption>Example usage </caption>

  var audioFile = "audio_sample.wav";
  var keys = { username: "youtwatson stt keys", password:"you watson stt service pswd"};
  language = "en-US_BroadbandModel";

  var sendToIBMWatsonUtil = new sendToIBMWatson();
  sendToIBMWatsonUtil.send(audioFile, keys, language, function(data) {
    //data is a IBM JSON transcription
  })
* @requires fs
* @requires watson-developer-cloud
* @tutorial IBM_watson_stt_specs
*/

'use strict';
const fs = require('fs');
const SpeechToTextV1 = require('ibm-watson/speech-to-text/v1');
const { IamAuthenticator } = require('ibm-watson/auth');
const { BasicAuthenticator } = require('ibm-watson/auth');

/**
* @function sendToIBMWatson
* @description send audio file to IBM STT API and get json transcription  back
* @param {string} audioFile - file path to audio file to transcribe
* @param {string} keys - json object with `username` and `password` for IBM STT Service as set by Bluemix
* @param {string} keys.username - username for IBM STT service
* @param {string} keys.pasword - password for IBM STT service
* @recognizeParams {string} language - one of the supported languages by IBM STT Services
* @returns promise with file path to text file containing transcriptions.
@example <caption>IBM supported languages </caption>
// dictionary that matches language with IBM language  models
ar-AR_BroadbandModel
en-UK_BroadbandModel
en-UK_NarrowbandModel
en-US_BroadbandModel
en-US_NarrowbandModel
es-ES_BroadbandModel
es-ES_NarrowbandModel
fr-FR_BroadbandModel
ja-JP_BroadbandModel
ja-JP_NarrowbandModel
pt-BR_BroadbandModel
pt-BR_NarrowbandModel
zh-CN_BroadbandModel
zh-CN_NarrowbandModel
ko-KR_BroadbandModel
ko-KR_NarrowbandModel
...
*/
const sendToIBMWatson = (audioFile, keys, language) => {
  console.log('keys', keys);
  console.log('language', language);
  // credentials for STT API

  let speechToText;
  // If the username is 'apikey', we're using a newer Watson STT instance, so we'll add the iam_apikey property and set an instance
  // endpoint URL if there is one.
  // if (keys.username === 'apikey') {
  speechToText = new SpeechToTextV1({
    authenticator: new IamAuthenticator({
      apikey: keys.password,
    }),
    serviceUrl: keys.url,
    // disableSslVerification: true,
    headers: {
      'X-Watson-Learning-Opt-Out': 'true',
    },
  });
  // } else {
  //   speechToText = new SpeechToTextV1({
  //     authenticator: new BasicAuthenticator({
  //       username: keys.username,
  //       password: keys.password,
  //     }),
  //     serviceUrl: keys.url,
  //     // disableSslVerification: true,
  //     headers: {
  //       'X-Watson-Learning-Opt-Out': 'true',
  //     },
  //   });
  // }

  // recognizeParams to send to IBM STT API request
  const recognizeParams = {
    audio: fs.createReadStream(audioFile),
    contentType: 'audio/wav',
    // contentType: 'application/octet-stream',
    model: language,
    // The time in seconds after which, if only silence (no speech) is detected in submit  ted audio, the connection is closed with a 400 response code. The default is 30 seconds. Useful for stopping audio submission from a live microphone when a user simply walks away. Use -1 for infinity.
    inactivityTimeout: -1,
    // Indicates whether multiple final results that represent consecutive phrases separated by long pauses are returned. If true, such phrases are returned; if false (the default), recognition ends after the first "end of speech" incident is detected.
    continuous: true,
    // turning of profinity filter which is set to true by default and only works for US english.
    profanityFilter: false,
    // indicates whether time alignment is returned for each word. The default is false.
    timestamps: true,
    // if true, the response includes labels that identify which words were spoken by which participants in a multi-person exchange. By default, the service returns no speaker labels. Setting speaker_labels to true forces the timestamps parameter to be true, regardless of whether you specify false for the parameter.
    // Note: Applies to US English, Australian English, German, Japanese, Korean, and Spanish (both broadband and narrowband models) and UK English (narrowband model) transcription only.
    speakerLabels: true,
    // boolean
    // If true, the service converts dates, times, series of digits and numbers, phone numbers, currency values, and internet addresses into more readable, conventional representations in the final transcript of a recognition request. For US English, the service also converts certain keyword strings to punctuation symbols. By default, the service performs no smart formatting.
    // Note: Applies to US English, Japanese, and Spanish transcription only.
    smartFormatting: true,
  };

  console.log('here!!!-1');
  return new Promise((resolve, reject) => {
    console.log('here!!!0', recognizeParams);
    return speechToText
      .recognize(recognizeParams
      //   , [
      //   res => {
      //     console.log('res', res);
      //   },
      // ])
      .then(speechRecognitionResults => {
        console.log('here!!!1');
        console.log(JSON.stringify(speechRecognitionResults, null, 2));
        resolve(speechRecognitionResults);
      })
      .catch(err => {
        console.log('here!!!2');
        console.log('error:', err);
        // throw new Error(err);
        reject(err);
        // return err;
      });
  });
};

module.exports = sendToIBMWatson;
