import express from 'express';
import { verifyAyah, getDetailedFeedback } from '../services/groqVerification.js';
import Ayah from '../models/Ayah.js';

const router = express.Router();

router.post('/verify-ayah', async (req, res) => {
  const { text, correctAyahId, correctText } = req.body;
  
  try {
    let ayah;
    if (correctAyahId) {
      ayah = await Ayah.findById(correctAyahId);
    }
    
    const verification = await verifyAyah(text, ayah?.text || correctText);
    res.json({
      success: true,
      ...verification
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/ai-feedback', async (req, res) => {
  const { userText, correctText, accuracy, wrongWords } = req.body;
  
  try {
    const feedback = await getDetailedFeedback(userText, correctText, accuracy, wrongWords);
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/batch-verify', async (req, res) => {
  const { recitations } = req.body;
  
  try {
    const results = await Promise.all(
      recitations.map(async (rec) => {
        const verification = await verifyAyah(rec.userText, rec.correctText);
        return { id: rec.id, ...verification };
      })
    );
    res.json({ results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;