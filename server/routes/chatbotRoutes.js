const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();

const BAD_WORDS = ['fuck', 'shit', 'ass', 'bitch', 'crap', 'damn', 'hell'];

const containsProfanity = (text) => {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
};

router.post('/', async (req, res) => {
  try {
    const { messages, context } = req.body;
    
    if (!messages || messages.length === 0) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const lastMessage = messages[messages.length - 1];

    if (containsProfanity(lastMessage.content)) {
      return res.status(400).json({ reply: 'Please maintain a respectful tone. Foul language is not permitted.' });
    }

    // Context details
    const currentPath = context?.currentPath || 'Unknown';
    const previousPath = context?.previousPath || 'Unknown';
    const role = context?.role || 'guest';

    // Ensure API Key exists
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ reply: 'Chatbot is currently offline. Please configure the Gemini API key.' });
    }

    // Set up Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    // System prompt enforcement
    const systemPrompt = `
      You are GladiAssist, a professional AI support chatbot for GladiConnect - an NGO and Volunteer collaboration platform.
      The user is currently a ${role}.
      They are on the page: ${currentPath} and came from: ${previousPath}.
      
      STRICT RULES:
      1. You must ONLY answer questions if they are related to the current page (${currentPath}) or the previous page (${previousPath}), or general platform FAQs (e.g. how to register, what is the platform).
      2. If the user asks about something unrelated, politely decline and state you can only assist with the current page context.
      3. NEVER reveal or attempt to query sensitive database information (passwords, private IDs, user personal details). If asked, politely refuse for security reasons.
      4. Never use foul language. Always remain professional and helpful.
      5. Keep responses concise and directly address the user's query.
    `;

    // Convert history into a transcript to avoid strict Gemini role alternation validation
    const transcript = messages.slice(0, -1).map(msg => 
      `${msg.role === 'assistant' ? 'GladiAssist' : 'User'}: ${msg.content}`
    ).join('\n');

    // Inject system rules and history into the latest query
    const finalQuery = `
      SYSTEM INSTRUCTIONS: ${systemPrompt}
      
      PREVIOUS CONVERSATION HISTORY:
      ${transcript || 'No previous history.'}

      USER MESSAGE: ${lastMessage.content}
    `;

    // Create a fresh chat session and pass everything in the first message
    const chat = model.startChat();

    const result = await chat.sendMessage(finalQuery);
    const replyText = result.response.text();

    res.json({ reply: replyText });

  } catch (error) {
    console.error('Chatbot API Error:', error);
    res.status(500).json({ reply: 'I encountered an error processing your request. Please ensure the API key is configured and try again.' });
  }
});

module.exports = router;
