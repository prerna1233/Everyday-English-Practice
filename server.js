

// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import {GoogleGenerativeAI} from "@google/generative-ai";

// dotenv.config();

// const app = express();
// app.use(cors());
// app.use(express.static('public'));
// console.log(process.env.GEMINI_API_KEY );

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// async function generateHindiSentence() {
//   const result = await model.generateContent("Give me one Hindi sentence that can be used for English speaking practice.");
//   const response = await result.response;
//   const text = await response.text();
//   return text.trim();
// }

// app.get('/generate-sentence', async (req, res) => {
//   try {
//     const sentence = await generateHindiSentence();
//     console.log("Generated sentence:", sentence);

//     res.json({ hindi: sentence });
//   } catch (error) {
//     console.error("Gemini error:", error);
//     res.status(500).json({ error: "Failed to generate sentence" });
//   }
// });


// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running at http://localhost:${PORT}`);
// });

// console.log("API Key loaded:", process.env.GEMINI_API_KEY);













import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Store used sentences here to avoid repetition during server runtime
const usedSentences = new Set();

async function generateHindiSentence() {
  const prompt = `
Generate 5 different simple Hindi sentences for daily English speaking practice.
Requirements:
- Each sentence 5 to 10 words.
- Use common daily life topics like family, travel, shopping, greetings.
- Make sentences easy and natural for beginners, like "क्या तुम कहीं जा रहे हो?"
- Do not repeat or use very similar sentences.
Return only the sentences separated by line breaks without extra explanations.
`;

  const result = await model.generateContent(prompt, { temperature: 0.8 });
  const response = await result.response;
  const sentences = response.text().trim().split('\n').map(s => s.trim()).filter(Boolean);

  // Filter out sentences that have already been used
  const newSentences = sentences.filter(s => !usedSentences.has(s));

  if (newSentences.length === 0) {
    // If all sentences have been used, clear the set and start over
    usedSentences.clear();
    // Return one sentence from original list
    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];
    usedSentences.add(randomSentence);
    return randomSentence;
  }

  // Pick one new sentence randomly
  const randomSentence = newSentences[Math.floor(Math.random() * newSentences.length)];
  usedSentences.add(randomSentence);
  return randomSentence;
}

app.get('/generate-sentence', async (req, res) => {
  try {
    const hindi = await generateHindiSentence();
    console.log("Generated Hindi sentence:", hindi);
    res.json({ hindi });
  } catch (error) {
    console.error("Error generating sentence:", error);
    res.status(500).json({ error: "Failed to generate Hindi sentence" });
  }
});

// The rest stays same: POST /check-translation endpoint

app.post('/check-translation', async (req, res) => {
  const { hindi, english } = req.body;

  if (!hindi || !english) {
    return res.status(400).json({ error: "Missing input fields" });
  }

  const prompt = `The user translated this Hindi sentence into English for daily communication:
Hindi: "${hindi}"
English: "${english}"

Act like a friendly English teacher. Is the translation correct for everyday conversation? 
If it's wrong, suggest a more natural or common way to say it in English. Keep your reply short (1–4 lines).`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const feedback = response.text().trim();
    res.json({ feedback });
  } catch (error) {
    console.error("Error checking translation:", error);
    res.status(500).json({ error: "Failed to check translation" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
