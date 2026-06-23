require('dotenv').config({ path: '../.env' });
const fs = require('fs');

async function test() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    fs.writeFileSync('models_list.json', JSON.stringify(data, null, 2));
    console.log("Dumped models to models_list.json");
  } catch(e) {
    console.error(e.message);
  }
}

test();
