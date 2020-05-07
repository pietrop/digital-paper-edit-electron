/* eslint-disable no-case-declarations */
const fs = require('fs');
const path = require('path');
const fiveMinStt = require('five-min-stt');
const ffmpegBin = require('ffmpeg-static-electron');
const ffprobeBin = require('ffprobe-static-electron');
const ffmpegBinPath = ffmpegBin.path;
const ffprobeBinPath = ffprobeBin.path;
const convertToAudio = require('../convert-to-audio/index.js');
const convertAssemblyAIToDpeJson = require('./assemblyai/assemblyai-to-dpe/index.js');
const assemblyAiStt = require('./assemblyai/index');
const speechmaticsSTT = require('./speechmatics/index.js');
const convertSpeechmaticsDpe = require('./speechmatics/speechmatics-to-dpe/index.js');
const pocketsphinxSTT = require('./pocketsphinx-stt/index.js');
const deepspeechSTT = require('./deepspeech/index.js');
const convertPocketsphinxOutputToDpe = require('./pocketsphinx-stt/pocketsphinx-to-dpe/index.js');
const { getDefaultStt } = require('../../../stt-settings/default-stt.js');
const { getDeepSpeechModelPath } = require('../../../stt-settings/credentials.js');

function getDefaultSttAndLanguage() {
  // const pathToDefaultStt = path.join(dataPath, 'default-stt.json');
  // const defaultStt = JSON.parse(fs.readFileSync(pathToDefaultStt).toString());
  const defaultStt = getDefaultStt();
  console.log('getDefaultSttAndLanguage', defaultStt);

  return defaultStt;
}

const transcriber = async (data, mediaDir) => {
  const inputFilePath = data.path;
  const uid = data.id;
  // default stt engine and language
  const { provider, language, languageModel } = getDefaultSttAndLanguage();
  if (!provider) {
    // TODO: should probably do this check and throw this error before converting video preview as well?
    throw new Error('Default STT Engine has not been set');
  }
  const defaultSttEngine = provider;
  // returning the data from the transcription
  // as a way to preserve the id for this transcription job
  const response = { ...data };
  //   check media folder exits
  if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir);
  }

  // convert to audio
  const inputFileName = path.parse(inputFilePath).name;
  const inputFileNameWithExtension = `${inputFileName}${path.parse(inputFilePath).ext}`;
  const audioFileOutput = path.join(mediaDir, inputFileName);

  // TODO: add try catch
  const newAudioFile = await convertToAudio(inputFilePath, audioFileOutput, uid);
  response.url = await newAudioFile;

  // transcribe
  switch (defaultSttEngine) {
    case 'AssemblyAI':
      // const assemblyAITranscript = await assemblyAiStt(newAudioFile, language, languageModel);
      // response.transcript = await convertAssemblyAIToDpeJson(assemblyAITranscript);
      // response.clipName = inputFileNameWithExtension;
      // response.sttEngine = 'AssemblyAI';
      // return response;

      const sttTranscribeFunctionAssemblyAi = async filePath => {
        // return await assemblyai({ ApiKey, filePath });
        const assemblyAITranscript = await assemblyAiStt(filePath, language, languageModel);
        return assemblyAITranscript;
      };

      const assemblyAITranscriptResp = await fiveMinStt({
        file: newAudioFile,
        ffmpegBinPath,
        ffprobeBinPath,
        sttTranscribeFunction: sttTranscribeFunctionAssemblyAi,
      });

      // .then(resp => {
      console.log('example usage, fiveMinStt::', JSON.stringify(assemblyAITranscriptResp, null, 2));
      const assemblyAITranscript = { words: assemblyAITranscriptResp };
      response.transcript = await convertAssemblyAIToDpeJson(assemblyAITranscript);
      response.clipName = inputFileNameWithExtension;
      response.sttEngine = 'AssemblyAI';
      return response;
    // });

    case 'Speechmatics':
      // const speechmaticsTranscript = await speechmaticsSTT(newAudioFile, language);
      // response.transcript = convertSpeechmaticsDpe(speechmaticsTranscript);
      // response.clipName = inputFileNameWithExtension;
      // response.sttEngine = 'Speechmatics';
      // return response;

      const sttTranscribeFunctionSpeechmatics = async filePath => {
        // return await assemblyai({ ApiKey, filePath });
        const speechmaticsTranscript = await speechmaticsSTT(filePath, language);
        return convertSpeechmaticsDpe(speechmaticsTranscript);
      };

      const speechmaticsTranscript = await fiveMinStt({
        file: newAudioFile,
        ffmpegBinPath,
        ffprobeBinPath,
        sttTranscribeFunction: sttTranscribeFunctionSpeechmatics,
      });
      console.log('example usage, fiveMinStt - speechmaticsTranscript ::', JSON.stringify(speechmaticsTranscript, null, 2));
      // .then(resp => {
      // const speechmaticsTranscript = resp;
      response.transcript = convertSpeechmaticsDpe(speechmaticsTranscript);
      response.clipName = inputFileNameWithExtension;
      response.sttEngine = 'Speechmatics';
      return response;
    // });
    case 'pocketsphinx':
      const pocketsphinxTranscript = await pocketsphinxSTT(newAudioFile);
      console.log('pocketsphinxTranscript', pocketsphinxTranscript);
      response.transcript = convertPocketsphinxOutputToDpe(pocketsphinxTranscript);
      response.clipName = inputFileNameWithExtension;
      console.log('pocketsphinxTranscript', response);
      response.sttEngine = 'pocketsphinx';
      return response;
    case 'deepspeech':
      console.log('transcriber:deepspeech');
      const deepspeechModelsPath = getDeepSpeechModelPath();
      const deepspeechTranscript = await deepspeechSTT(newAudioFile, deepspeechModelsPath);
      const { dpeResult } = await deepspeechTranscript;
      console.log('deepspeechTranscript', deepspeechTranscript, dpeResult);
      response.transcript = dpeResult;
      response.clipName = inputFileNameWithExtension;
      console.log('deepspeechTranscript', response);
      response.sttEngine = 'deepspeech';
      return response;
    default:
      throw new Error("A valid STT engine wasn't specified in the transcriber module");
  }
  // return transcription
};

module.exports = transcriber;
