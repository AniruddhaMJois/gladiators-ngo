async function test() {
  const res = await fetch('http://localhost:5000/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [
        { role: 'assistant', content: 'Hello! I am GladiAssist, your AI guide. I can help answer questions based on the page you are currently viewing. How can I assist you today?' },
        { role: 'user', content: 'What is this platform?' }
      ],
      context: {
        currentPath: '/',
        previousPath: 'none',
        role: 'guest'
      }
    })
  });
  const data = await res.json();
  console.log(res.status, data);
}

test();
