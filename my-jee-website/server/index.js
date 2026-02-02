import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import { renderMotion1DVideo } from './renderVideo.mjs';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from the project root (one level up from server/)
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();

// CORS configuration for production
const corsOptions = {
  origin: process.env.FRONTEND_URL || '*', // Allow all origins in development
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Serve static videos
app.use('/videos', express.static(join(__dirname, '..', 'public', 'videos')));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const systemInstruction = `You are "Dr. Neutron", a JEE tutor. Keep responses ULTRA SHORT (max 80 words).

FORMATTING RULES - CRITICAL:
1. Use LaTeX ONLY for math: \\( E=mc^2 \\) or \\[ F=ma \\]
2. NO markdown (* # ### etc). Plain text only.
3. Use ACTUAL line breaks for paragraphs (just press Enter twice), NOT the literal text "\\n\\n"
4. NO introductions. Direct answers only.

RESPONSE STYLE:
- Definitions: 1-2 sentences max
- Concepts: Key point + equation only
- Numerical: Steps with LaTeX, brief
- Non-JEE topics: "That's outside JEE syllabus."

Be concise. No fluff.`;

// Define multiple models to try in order (using correct model names from API)
const MODEL_FALLBACKS = [
    "models/gemini-2.5-flash",              // Stable Gemini 2.5 Flash
    "models/gemini-2.0-flash",              // Stable Gemini 2.0 Flash
    "models/gemini-2.0-flash-lite",         // Lighter Gemini 2.0
    "models/gemini-flash-latest",           // Latest Flash version
    "models/gemini-2.5-pro",                // Gemini 2.5 Pro (fallback)
    "models/gemini-pro-latest",             // Latest Pro
    "models/gemini-2.0-flash-exp",          // Experimental (last resort)
];

// Function to get a working model
async function getWorkingModel(chatHistory, message) {
    for (let i = 0; i < MODEL_FALLBACKS.length; i++) {
        const modelName = MODEL_FALLBACKS[i];
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({
                model: modelName,
                systemInstruction: systemInstruction
            });

            // Test the model with a simple request
            let chat;
            if (chatHistory.length > 0) {
                chat = model.startChat({ history: chatHistory });
            } else {
                chat = model.startChat();
            }

            // Try to send the message
            const result = await chat.sendMessageStream(message);

            // If we get here, the model works!
            console.log(`✓ Using model: ${modelName}`);
            return { model, chat, result };
        } catch (error) {
            console.log(`✗ Model ${modelName} failed: ${error.message}`);

            // If this is the last model, throw the error
            if (i === MODEL_FALLBACKS.length - 1) {
                throw error;
            }
            // Otherwise, try the next model
            continue;
        }
    }
}

// Store chat sessions in memory (in production, use a proper session store)
const chatSessions = new Map();

app.post('/chat', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: "Error: GEMINI_API_KEY not configured. Please set it in your .env file." });
        }

        const { message, history } = req.body;

        if (!message) {
            return res.status(400).json({ reply: "Error: No message provided." });
        }

        // Convert history format to match Gemini API
        let chatHistory = [];
        if (history && Array.isArray(history) && history.length > 0) {
            chatHistory = history
                .filter(msg => msg.role && (msg.parts || msg.text)) // Filter valid messages
                .map(msg => {
                    const role = (msg.role === 'bot' || msg.role === 'model') ? 'model' : 'user';
                    const text = msg.parts?.[0]?.text || msg.text || '';
                    return {
                        role: role,
                        parts: [{ text: text }]
                    };
                });

            // Remove any leading 'model' messages - Gemini requires first message to be from 'user'
            while (chatHistory.length > 0 && chatHistory[0].role === 'model') {
                chatHistory.shift();
            }
        }

        // Set headers for streaming
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Try models with fallback
        const { model, chat, result } = await getWorkingModel(chatHistory, message);

        // Stream chunks to client
        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            res.write(chunkText);
        }

        res.end();
    } catch (error) {
        console.error('Server error:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('Request body:', JSON.stringify(req.body, null, 2));

        let errorMessage = "Error connecting to Dr. Neutron.";
        if (error.message) {
            errorMessage = error.message;
        } else if (error.toString) {
            errorMessage = error.toString();
        }

        // If headers not sent yet, send JSON error
        if (!res.headersSent) {
            res.status(500).json({ reply: `Error: ${errorMessage}` });
        } else {
            // If streaming already started, write error to stream
            res.write(`\n\nError: ${errorMessage}`);
            res.end();
        }
    }
});

// Video Generation Endpoint using D-ID API
app.post('/api/generate-video', async (req, res) => {
    console.log("Handling POST request on /api/generate-video");
    try {
        const { text } = req.body;

        if (!text || typeof text !== 'string' || text.trim() === '') {
            return res.status(400).json({ error: 'Text is required for video generation.' });
        }

        if (!process.env.DID_API_KEY || process.env.DID_API_KEY === 'your_did_api_key_here') {
            return res.status(500).json({
                error: 'D-ID API key not configured. Please sign up at https://studio.d-id.com/ and add your API key to .env file.',
                needsSetup: true
            });
        }

        // Create D-ID talk video
        const createResponse = await axios.post(
            'https://api.d-id.com/talks',
            {
                script: {
                    type: 'text',
                    input: text,
                    provider: {
                        type: 'microsoft',
                        voice_id: 'en-US-JennyNeural' // Professional female voice
                    }
                },
                source_url: 'https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg' // Public avatar
            },
            {
                headers: {
                    'Authorization': `Basic ${process.env.DID_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const talkId = createResponse.data.id;
        console.log(`Video creation started: ${talkId}`);

        // Poll for video completion
        let videoUrl = null;
        let attempts = 0;
        const maxAttempts = 30; // 30 seconds max wait

        while (attempts < maxAttempts && !videoUrl) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second

            const statusResponse = await axios.get(
                `https://api.d-id.com/talks/${talkId}`,
                {
                    headers: {
                        'Authorization': `Basic ${process.env.DID_API_KEY}`
                    }
                }
            );

            if (statusResponse.data.status === 'done') {
                videoUrl = statusResponse.data.result_url;
                console.log(`Video ready: ${videoUrl}`);
            } else if (statusResponse.data.status === 'error') {
                throw new Error('Video generation failed');
            }

            attempts++;
        }

        if (!videoUrl) {
            return res.status(500).json({ error: 'Video generation timed out. Please try again.' });
        }

        res.json({
            videoUrl,
            talkId,
            message: 'Video generated successfully!'
        });

    } catch (error) {
        console.error("Error in /api/generate-video:", error.message);
        console.error("D-ID Response Status:", error.response?.status);
        console.error("D-ID Response Data:", JSON.stringify(error.response?.data, null, 2));
        console.error("Request Data:", JSON.stringify(req.body, null, 2));

        res.status(500).json({
            error: error.response?.data?.description || error.response?.data?.message || 'Failed to generate video.',
            details: error.message,
            didError: error.response?.data
        });
    }
});

// Motion1D Video Generation Endpoint using Remotion
app.post('/api/generate-motion-video', async (req, res) => {
    console.log("Handling POST request on /api/generate-motion-video");
    try {
        const { question } = req.body;

        if (!question || typeof question !== 'string' || question.trim() === '') {
            return res.status(400).json({ error: 'Question is required for video generation.' });
        }

        // Use Gemini to extract motion parameters from the question
        const prompt = `Analyze this physics question: "${question}"

Determine the motion type:
- If the question mentions: projectile, trajectory, angle, thrown, launched, parabola, 2D motion → motionType = "projectile"
- If the question mentions: straight line, 1D motion, constant acceleration, car, train → motionType = "linear"

Extract parameters and return ONLY this JSON format (no extra text):
{
  "title": "Brief title max 30 chars",
  "motionType": "projectile",
  "initialVelocity": 20,
  "acceleration": 2,
  "angle": 45,
  "showGraph": true
}

Rules:
- For projectile: initialVelocity default 20, angle default 45
- For linear: initialVelocity default 0, acceleration default 2
- Extract actual values from question if mentioned
- showGraph: true if question asks about graphs

Return JSON only:`;

        // Try to use a working model for video generation
        let response;
        for (const modelName of MODEL_FALLBACKS) {
            try {
                console.log(`Trying model for video gen: ${modelName}`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction
                });
                const result = await model.generateContent(prompt);
                response = result.response.text();
                console.log(`✓ Video gen using model: ${modelName}`);
                break;
            } catch (error) {
                console.log(`✗ Video gen model ${modelName} failed: ${error.message}`);
                if (modelName === MODEL_FALLBACKS[MODEL_FALLBACKS.length - 1]) {
                    throw error;
                }
            }
        }

        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const params = jsonMatch ? JSON.parse(jsonMatch[0]) : {
            title: 'Motion in 1D',
            motionType: 'linear',
            initialVelocity: 0,
            acceleration: 2,
            angle: 45,
            showGraph: true
        };

        console.log('Extracted parameters:', params);

        // Render the video
        console.log('Starting video render...');
        const videoUrl = await renderMotion1DVideo(params);
        console.log('Video rendered successfully:', videoUrl);

        res.json({
            videoUrl: `http://localhost:3000${videoUrl}`,
            message: 'Video generated successfully!',
            params
        });

    } catch (error) {
        console.error("Error in /api/generate-motion-video:", error);
        res.status(500).json({
            error: 'Failed to generate motion video.',
            details: error.message
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Dr. Neutron Brain active on port ${PORT}`);
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️  WARNING: GEMINI_API_KEY not found in environment variables!");
    }
    if (!process.env.DID_API_KEY || process.env.DID_API_KEY === 'your_did_api_key_here') {
        console.warn("⚠️  WARNING: DID_API_KEY not configured. Video generation feature will not work.");
        console.warn("   Sign up at https://studio.d-id.com/ to get your API key.");
    }
});