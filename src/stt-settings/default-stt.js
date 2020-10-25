const fs = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');
const appUserDataPath = ipcRenderer.sendSync('synchronous-message-get-user-data-folder', 'ping');
const defaultSttTemplate = {
  // Provider could be '' unspecified,
  // or pocketsphinx, to give a working default to the app.
  // altho having pocketsphinx as default causes issue in windows version where it's not available
  provider: '',
  language: null,
  languageModel: null,
};

function deepCopy(data) {
  return JSON.parse(JSON.stringify(data));
}

function getDefaultSttFilePath() {
  return path.join(appUserDataPath, 'default-stt.json');
}

function setDefaultStt(data) {
  fs.writeFileSync(getDefaultSttFilePath(), JSON.stringify(data, null, 2));
}

function getDefaultStt() {
  let defaultStt = deepCopy(defaultSttTemplate);
  //   defaultStt.provider = data.provider;
  //   defaultStt.language = data.language;
  const defaultSttFilePath = getDefaultSttFilePath();

  if (fs.existsSync(defaultSttFilePath)) {
    defaultStt = JSON.parse(fs.readFileSync(defaultSttFilePath).toString());

    return defaultStt;
  } else {
    return defaultStt;
  }
}

module.exports.setDefaultStt = setDefaultStt;
module.exports.getDefaultStt = getDefaultStt;
