const fs = require('fs');
const path = require('path');
const downloadDeepSpeechModel = require('deepspeech-node-wrapper').downloadDeepSpeechModel;
const { ipcRenderer } = require('electron');
const appUserDataPath = ipcRenderer.sendSync('synchronous-message-get-user-data-folder', 'ping');
// TODO: consider moving deepspeech logic to a separate file from credentials.js?

const DEEP_SPEECH_MODEL_V = '0.9.3';

function getDeepSpeechModelFolderName(modelVersion = DEEP_SPEECH_MODEL_V) {
  // return `deepspeech-${modelVersion}-models`;
  return 'models';
}

function getDeepSpeechModelPath(deepspeechModelVersion) {
  return path.join(appUserDataPath, getDeepSpeechModelFolderName(deepspeechModelVersion));
}

// TODO: add some way to check if model,
// folder and necessary files,
// are set in user folder in application libary path
// Files required described in README of https://github.com/pietrop/deepspeech-node-wrapper
function getIsDeepspeechModelSet() {
  // eg check if this path exists?
  const deepSpeechModelPath = getDeepSpeechModelPath();
  const isDeepSpeechModelPath = fs.existsSync(deepSpeechModelPath);
  // Extra checks to make sure the files needed by the model exists
  //  "output_graph.pbmm"
  const outputGraphPbmmPath = path.join(deepSpeechModelPath, 'deepspeech-0.9.3-models.pbmm');
  const isOutputGraphPbmmPath = fs.existsSync(outputGraphPbmmPath);
  //  "lm.binary"
  // const lmBinaryPath = path.join(deepSpeechModelPath, 'lm.binary');
  // const islBinaryPath = fs.existsSync(lmBinaryPath);
  // "trie"
  // const triePath = path.join(deepSpeechModelPath, 'trie');
  // const isTriePath = fs.existsSync(triePath);

  // return isDeepSpeechModelPath && isTriePath && islBinaryPath && isOutputGraphPbmmPath;
  return isDeepSpeechModelPath && isOutputGraphPbmmPath;
}

function setDeepSpeechModel(progressCallback) {
  console.log('setDeepSpeechModel');
  const outputPath = path.join(appUserDataPath); //getDeepSpeechModelPath();

  return new Promise((resolve, reject) => {
    downloadDeepSpeechModel(outputPath, DEEP_SPEECH_MODEL_V, progressCallback)
      .then((res) => {
        console.log('res', res);
        resolve(res);
      })
      .catch((error) => {
        console.error('error setting up the Deepspeech model, during download', error);
        reject(error);
      });
  });
}

const credentialsTemplate = {
  provider: '',
  sttUserName: '',
  sttAPIKey: '',
  sttAPIUrl: '',
};

function deepCopy(data) {
  return JSON.parse(JSON.stringify(data));
}

function getCredentialsFilePath(provider) {
  return path.join(appUserDataPath, `${provider}.json`);
}

function setCredentials(data) {
  fs.writeFileSync(getCredentialsFilePath(data.provider), JSON.stringify(data, null, 2));
}

function getCredentials(provider) {
  let credentials = deepCopy(credentialsTemplate);
  credentials.provider = provider;
  const credentialsFilePath = getCredentialsFilePath(provider);

  if (fs.existsSync(credentialsFilePath)) {
    credentials = JSON.parse(fs.readFileSync(credentialsFilePath).toString());

    return credentials;
  } else {
    return credentials;
  }
}

function areCredentialsSet(provider) {
  const credentials = getCredentials(provider);
  switch (provider) {
    case 'AssemblyAI':
      return credentials.sttAPIKey !== '';
    case 'Speechmatics':
      return credentials.sttUserName !== '' && credentials.sttAPIKey !== '';
    default:
      console.error(`Could not find credentials for provier: ${provider}`);

      return false;
  }
}

module.exports.setCredentials = setCredentials;
module.exports.getCredentials = getCredentials;
module.exports.areCredentialsSet = areCredentialsSet;
module.exports.getIsDeepspeechModelSet = getIsDeepspeechModelSet;
module.exports.setDeepSpeechModel = setDeepSpeechModel;
module.exports.getDeepSpeechModelPath = getDeepSpeechModelPath;
