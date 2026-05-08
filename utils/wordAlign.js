import { wordsMatch } from "./quranNormalizer.js";

/**
 * Smart word alignment (NO AI needed)
 */
export const compareAyah = (spoken, correct) => {
  const userWords = spoken.split(" ").filter(Boolean);
  const correctWords = correct.split(" ").filter(Boolean);

  let correctCount = 0;
  const wrongWords = [];

  const maxLen = Math.max(userWords.length, correctWords.length);

  for (let i = 0; i < maxLen; i++) {
    const u = userWords[i];
    const c = correctWords[i];

    if (!u || !c) {
      wrongWords.push({
        position: i + 1,
        userWord: u || null,
        correctWord: c || null,
        type: !u ? "missing" : "extra",
      });
      continue;
    }

    if (wordsMatch(u, c)) {
      correctCount++;
    } else {
      wrongWords.push({
        position: i + 1,
        userWord: u,
        correctWord: c,
        type: "mismatch",
      });
    }
  }

  const accuracy = Math.round((correctCount / correctWords.length) * 100);

  return {
    accuracy,
    wrongWords,
    isCorrect: accuracy >= 95,
  };
};