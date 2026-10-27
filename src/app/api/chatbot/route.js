import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const BAD_WORDS = ['fuck', 'shit', 'ass', 'bitch', 'crap', 'damn', 'hell'];

const containsProfanity = (text) => {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
};

export async function POST(request) {
  try {
    const { messages, context } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];
    const messageContent = lastMessage?.content || lastMessage?.text || '';

    if (containsProfanity(messageContent)) {
      return NextResponse.json({ reply: 'Please maintain a respectful tone. Foul language is not permitted.' }, { status: 400 });
    }

    const currentPath = context?.currentPath || 'Unknown';
    const previousPath = context?.previousPath || 'Unknown';
    const role = context?.role || 'guest';

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ reply: 'Chatbot is currently offline. Please configure the Gemini API key.' }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash or gemini-1.5-flash fallback
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

    const transcript = messages.slice(0, -1).map(msg =>
      `${msg.role === 'assistant' ? 'GladiAssist' : 'User'}: ${msg.content || msg.text || ''}`
    ).join('\n');

    const finalQuery = `
      SYSTEM INSTRUCTIONS: ${systemPrompt}
      
      PREVIOUS CONVERSATION HISTORY:
      ${transcript || 'No previous history.'}

      USER MESSAGE: ${messageContent}
    `;

    const chat = model.startChat();

    let replyText = '';
    let retries = 3;
    while (retries > 0) {
      try {
        const result = await chat.sendMessage(finalQuery);
        replyText = result.response.text();
        break;
      } catch (err) {
        retries--;
        if (retries === 0 || !err.message.includes('503')) throw err;
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    return NextResponse.json({ reply: replyText }, { status: 200 });
  } catch (error) {
    console.error('Chatbot API Error:', error);
    return NextResponse.json({ reply: 'I encountered an error processing your request. Please ensure the API key is configured and try again.' }, { status: 500 });
  }
}
