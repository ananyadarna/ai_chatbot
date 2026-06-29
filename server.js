const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('WARNING: GEMINI_API_KEY is not set in the environment variables.');
}
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// Chat API Endpoint (Streaming)
app.post('/api/chat', async (req, res) => {
  if (!genAI) {
    return res.status(500).json({ error: 'Gemini API key is missing. Please configure it in the .env file.' });
  }

  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    // Set headers for Server-Sent Events (SSE) to support streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Use gemini-2.5-flash as the default model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    // Format the conversation history for the Gemini API
    // Gemini expects history in the format: { role: 'user'|'model', parts: [{ text: string }] }
    const contents = [];
    if (history && Array.isArray(history)) {
      history.forEach(msg => {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        });
      });
    }

    // Add the current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    // Generate streaming content
    const result = await model.generateContentStream({ contents });

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
      }
    }

    // Signal completion
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Error during chat generation:', error);
    // If headers have already been sent, we can't send a JSON error, just end the stream
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'An error occurred during generation.' })}\n\n`);
      res.end();
    } else {
      res.status(500).json({ error: 'Failed to generate response from AI.' });
    }
  }
});

// Fallback route to serve index.html for single page app routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` AI Chatbot Server is running!`);
  console.log(` Local: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
