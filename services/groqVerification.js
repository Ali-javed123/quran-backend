
import Groq from 'groq-sdk';
import dotenv from "dotenv";
import { normalizeArabicText, calculateWordAccuracy, findWrongWords } from '../utils/arabicNormalizer.js';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
console.log("grow:",process.env.GROQ_API_KEY)
/**
 * Compare spoken ayah with correct Quranic ayah using Groq AI
 * @param {string} spokenText - Arabic text from speech recognition
 * @param {string} correctText - Correct ayah from DB
 * @returns {Promise<Object>} Verification result
 */
export const verifyAyah = async (spokenText, correctText) => {
  const normalizedSpoken = normalizeArabicText(spokenText);
  const normalizedCorrect = normalizeArabicText(correctText);
  
  const prompt = `You are an expert Quran recitation verification system. Compare the user's recited Arabic ayah with the correct Quranic ayah.

USER RECITED: "${spokenText}"
CORRECT AYAH: "${correctText}"

Analyze carefully and respond in valid JSON format with:
- match: boolean (true if recitation is correct, false if any mistake)
- accuracy: number (percentage 0-100)
- correction: string (the correct ayah text if there were mistakes)
- diff: string (description of what was wrong)
- wrongWords: array of objects with {userWord, correctWord, position}

Output ONLY valid JSON.`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { 
          role: "system", 
          content: "You are a strict Quranic Arabic comparison assistant. Output only valid JSON. Be precise and accurate." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    
    // Fallback to algorithmic comparison if AI fails
    const algorithmicAccuracy = calculateWordAccuracy(spokenText, correctText);
    const algorithmicWrongWords = findWrongWords(spokenText, correctText);
    
    return {
      match: result.match === true || algorithmicAccuracy >= 95,
      accuracy: result.accuracy || algorithmicAccuracy,
      correction: result.correction || correctText,
      diff: result.diff || (algorithmicAccuracy < 100 ? "Some words need improvement" : ""),
      wrongWords: result.wrongWords || algorithmicWrongWords
    };
  } catch (error) {
    console.error("Groq verification error:", error);
    
    // Fallback to algorithmic comparison
    const accuracy = calculateWordAccuracy(spokenText, correctText);
    const wrongWords = findWrongWords(spokenText, correctText);
    
    return {
      match: accuracy >= 95,
      accuracy: accuracy,
      correction: correctText,
      diff: accuracy >= 95 ? "" : "Mismatch detected in recitation",
      wrongWords: wrongWords
    };
  }
};

/**
 * Get detailed AI feedback for recitation improvement
 * @param {string} userText - User's recited text
 * @param {string} correctText - Correct ayah text
 * @param {number} accuracy - Accuracy percentage
 * @param {Array} wrongWords - List of wrong words
 * @returns {Promise<Object>} Detailed feedback
 */
export const getDetailedFeedback = async (userText, correctText, accuracy, wrongWords) => {
  const prompt = `As a Quran recitation teacher, provide detailed feedback for this recitation:

CORRECT AYAH: "${correctText}"
USER RECITED: "${userText}"
ACCURACY: ${accuracy}%
MISTAKES: ${JSON.stringify(wrongWords)}

Provide feedback in JSON format:
{
  "overall": "Overall assessment",
  "mistakes": [{"user": "wrong word", "correct": "correct word", "tip": "improvement tip"}],
  "encouragement": "Motivational message",
  "score": ${accuracy}
}`;

  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: "You are a kind and knowledgeable Quran recitation teacher. Provide helpful, constructive feedback. Output only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("AI feedback error:", error);
    
    // Fallback feedback
    const mistakes = wrongWords.map(w => ({
      user: w.userOriginal || w.userWord,
      correct: w.correctOriginal || w.correctWord,
      tip: w.isMissing ? "Add this word" : w.isExtra ? "Remove extra word" : "Practice pronunciation"
    }));
    
    return {
      overall: accuracy >= 90 ? "Excellent recitation!" : 
               accuracy >= 70 ? "Good effort, keep practicing!" : 
               "Please review this ayah carefully.",
      mistakes: mistakes,
      encouragement: accuracy >= 90 ? "Masha'Allah! Keep it up!" : 
                     "You're making progress. Practice makes perfect!",
      score: accuracy
    };
  }
};

export const verifyRecitation = async (req, res) => {
    const { spokenText, correctText, ayahReference } = req.body;

    if (!spokenText || !correctText) {
        return res.status(400).json({
            error: "spokenText aur correctText required hain"
        });
    }

    try {
        const result = await verifyAyah(spokenText, correctText);

        res.json({
            success: true,
            ...result,
            ayahReference
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Verification failed" });
    }
};  



                  