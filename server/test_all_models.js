require('dotenv').config({ path: '../.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testModels() {
  const modelsToTest = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-pro',
    'gemini-3.5-flash',
    'antigravity-preview-05-2026',
    'aqa'
  ];

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  for (const modelName of modelsToTest) {
    try {
      console.log(`Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("hello");
      console.log(`✅ ${modelName} SUCCESS! Response:`, result.response.text());
      return; // Stop at first success
    } catch(e) {
      console.log(`❌ ${modelName} FAILED:`, e.message);
    }
  }
}

testModels();
