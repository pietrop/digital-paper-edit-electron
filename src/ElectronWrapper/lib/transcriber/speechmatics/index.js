// const sampleJson = require('./speechmatics-to-dpe/speechmatics-short.sample.json');
const SendToSpeechmatics = require('./send-to-speechmatics.js');
const { getCredentials, areCredentialsSet } = require('../../../../stt-settings/credentials.js');

const speechmaticsSTT = (newFile, language = 'en') => {
  let speechmaticsCredentials;
  if (areCredentialsSet('Speechmatics')) {
    speechmaticsCredentials = getCredentials('Speechmatics');
    const credentials = {
      username: speechmaticsCredentials.sttUserName,
      password: speechmaticsCredentials.sttAPIKey,
    };

    // wrapping speechmatics module and SDK into a promise
    // to keep consistency in use with other stt modules
    // But not refactoring speechmatics module and sdk for now. eg it uses callbacks etc..
    return new Promise((resolve, reject) => {
      // if (process.env.NODE_ENV === 'development') {
      //   return resolve(sampleJson);
      // }

      const SendToSpeechmaticsUtil = new SendToSpeechmatics();

      SendToSpeechmaticsUtil.send(newFile, credentials, language, function(error, data) {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  } else {
    throw new Error('No credentials found for Speechmatics');
  }
};

module.exports = speechmaticsSTT;
