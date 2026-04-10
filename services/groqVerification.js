// const Groq = require( 'groq-sdk' );
import Groq from 'groq-sdk';
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq( {
    apiKey: process.env.GROQ_API_KEY
} );

/**
 * Compare spoken ayah with correct Quranic ayah.
 * @param {string} spokenText - Arabic text from speech recognition
 * @param {string} correctText - Correct ayah from DB
 * @returns {Promise<{match: boolean, correction: string, diff: string}>}
 */
const verifyAyah = async ( spokenText, correctText ) => {
    const prompt = `You are a Quran recitation verification system. Compare the user's recited Arabic ayah with the correct Quranic ayah. 
  - If they match exactly (ignoring minor diacritic differences but preserving meaning), return match: true.
  - If different, return match: false, and provide the correct ayah (correction) and highlight the wrong part (diff).
  Respond ONLY in valid JSON format: {"match": boolean, "correction": string, "diff": string}.

  User recited: "${spokenText}"
  Correct ayah: "${correctText}"`;

    try {
        const response = await groq.chat.completions.create( {
            model: "llama-3.1-8b-instant",
            messages: [
                { role: "system", content: "You are a strict Quranic Arabic comparison assistant. Output only JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.1,
            response_format: { type: "json_object" }
        } );

        const result = JSON.parse( response.choices[ 0 ].message.content );
        return {
            match: result.match === true,
            correction: result.correction || correctText,
            diff: result.diff || ""
        };
    } catch ( error ) {
        console.error( "Groq verification error:", error );
        // fallback: simple string comparison
        const match = spokenText.trim() === correctText.trim();
        return { match, correction: correctText, diff: match ? "" : "Mismatch detected" };
    }
};

export { verifyAyah };