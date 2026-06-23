require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const history = [
      { role: 'model', parts: [{ text: 'Hello! I am GladiAssist...' }] }
    ];

    const chat = model.startChat({ history });

    const result = await chat.sendMessage('Hi');
    console.log(result.response.text());
  } catch (err) {
    console.error("ERROR", err.message);
  }
}

test();
