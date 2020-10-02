function normalizeWord(IBMWord) {
  return {
    start: IBMWord.start_time,
    end: IBMWord.end_time,
    text: IBMWord.alternatives[0].word,
  };
}

function ge2DWordsList(result) {
  return result.map(({ word_alternatives }) => {
    return word_alternatives.map(wordResult => {
      return normalizeWord(wordResult);
    });
  });
}

function getParagraphs(wordList2d) {
  return wordList2d.map(line => {
    return {
      start: line[0].start,
      end: line[line.length - 1].end,
      speaker: 'U_UKN',
    };
  });
}

function normalizeParagraph(IBMparagraphs) {
  return IBMparagraphs.map(para => {
    return {
      start: para.from,
      end: para.to,
      speaker: `SPEAKER_${para.speaker}`,
    };
  });
}

function convertIBMWatsonToDpe({ results }) {
  // TODO: add speakers for each, line or see if speaker diarization is available
  const wordList2d = ge2DWordsList(results);

  //  if SpeakerLabelsResult available, else
  // from to speaker
  // SPEAKER_${speaker}
  let paragraphs = [];
  if (results.SpeakerLabelsResult) {
    paragraphs = normalizeParagraph(results.SpeakerLabelsResult);
  } else {
    paragraphs = getParagraphs(wordList2d);
  }

  const transcript = {
    paragraphs: paragraphs,
    words: wordList2d.flat(),
  };

  //   const normalisedWords = normaliseWords(words);
  //   const wordsWithPunctuation = appendPunctuationToPreviousWord(normalisedWords);
  //   const wordsWithIds = addIdToWords(wordsWithPunctuation);
  //   transcript.words = deepCopy(wordsWithIds);
  //   const dpeParagraphs = generateDpeParagraphs(wordsWithIds);
  //   const normalisedSpeakers = normaliseWords(speakers);
  //   transcript.paragraphs = addSpeakerLabelToParagraphs(normalisedSpeakers, dpeParagraphs);

  return transcript;
}

module.exports = convertIBMWatsonToDpe;
