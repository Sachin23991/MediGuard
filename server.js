// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 5500;

// Middleware setup
app.use(express.json());
app.use(cors());

// --- THIS IS THE NEW LINE YOU NEED TO ADD ---
// It tells Express to serve your HTML, CSS, and JS files from the 'public' folder.
app.use(express.static('public'));
// ---------------------------------------------

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// API Endpoint to check medicine interactions
app.post('/check-interactions', async (req, res) => {
    try {
        const { medicines } = req.body;

        if (!medicines || medicines.length < 2) {
            return res.status(400).json({ error: 'Please provide at least two medicines to check.' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
            Analyze the following list of medications for a user: ${medicines.join(', ')}.

            Provide the analysis in a structured JSON format. The JSON object should have three main keys: "interactions", "side_effects", and "intelligent_suggestions".

            1.  **interactions**: An array of objects. Each object should represent an interaction between two specific medicines from the list.
                - If there are no interactions, the array should be empty.
                - Each interaction object must have:
                    - "medicines": An array of the two medicine names that interact.
                    - "severity": A string ('High', 'Moderate', 'Low').
                    - "description": A concise, easy-to-understand explanation of the interaction's effect on the body.

            2.  **side_effects**: An array of objects, one for each medicine provided.
                - Each object must have:
                    - "medicineName": The name of the medicine.
                    - "common": An array of strings listing common side effects.
                    - "severe": An array of strings listing severe side effects that require immediate medical attention.

            3.  **intelligent_suggestions**: An object providing actionable advice.
                 - "summary": A brief, overall summary of the findings.
                 - "recommendations": An array of strings with smart, safe recommendations. For any 'High' or 'Moderate' severity interactions found, suggest a safer course of action. For example, instead of just saying "X and Y interact," suggest "Instead of taking X and Y together, discuss with your doctor about potentially using Z, which has a similar effect to X but does not interact with Y." Be specific if possible and always include the strong recommendation to consult a doctor. If no significant interactions are found, provide general advice on medication safety.
        `;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        const jsonResponse = text.replace(/```json/g, '').replace(/```/g, '').trim();

        res.json(JSON.parse(jsonResponse));

    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'An error occurred while communicating with the AI model.' });
    }
});

app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
});