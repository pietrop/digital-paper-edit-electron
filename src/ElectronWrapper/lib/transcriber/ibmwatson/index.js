const sendToIBMWatson = require('./send-to-ibmwatson.js');
const { getCredentials, areCredentialsSet } = require('../../../../stt-settings/credentials.js');

const ibmWatsonSTT = (newFile, language = 'en') => {
  let ibmWatsonCredentials;
  if (areCredentialsSet('IBMWatson')) {
    ibmWatsonCredentials = getCredentials('IBMWatson');
    const credentials = {
      username: ibmWatsonCredentials.sttUserName,
      password: ibmWatsonCredentials.sttAPIKey,
      url: ibmWatsonCredentials.sttAPIUrl,
    };

    // wrapping IBM Watson module and SDK into a promise
    // to keep consistency in use with other stt modules
    // But not refactoring speechmatics module and sdk for now. eg it uses callbacks etc..
    return new Promise((resolve, reject) => {
      sendToIBMWatson(newFile, credentials, language)
        .then(data => {
          fs.writeFileSync(__dirname + '/test.ibmwatson.sample.json', JSON.stringify(data, null, 2));
          resolve(data);
        })
        .catch(error => {
          reject(error);
        });
    });
  } else {
    throw new Error('No credentials found for IBMWatson');
  }
};

module.exports = ibmWatsonSTT;
